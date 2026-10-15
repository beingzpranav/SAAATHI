import type { Server as HttpServer } from 'node:http';
import { Server as SocketIoServer, type Socket } from 'socket.io';
import { randomUUID } from 'node:crypto';
import cookie from 'cookie';
import type {
  JointChatMessage,
  RoomParticipant,
  UserTypingEvent,
} from '@saathi/shared';
import { verifyAccessToken, ACCESS_COOKIE_NAME } from './jwt.js';
import { logger } from './logger.js';
import { env } from '../config/env.js';
import { prisma } from './prisma.js';
import { groundedMockAdapter } from './llm/mock.adapter.js';

interface SocketUser {
  userId: string;
  name: string;
  role: 'LEARNER' | 'PARENT' | 'COUNSELLOR';
  householdId?: string;
}

// In-memory joint room state (recent messages and online participants per household)
const roomParticipants = new Map<string, Map<string, RoomParticipant>>();
const roomMessageHistory = new Map<string, JointChatMessage[]>();

let ioInstance: SocketIoServer | null = null;

export function getSocketServer(): SocketIoServer | null {
  return ioInstance;
}

export function broadcastAgendaUpdate(householdId: string): void {
  if (ioInstance) {
    ioInstance.to(`room:${householdId}`).emit('agenda:updated', {
      householdId,
      timestamp: new Date().toISOString(),
    });
  }
}

export function broadcastConcernShared(householdId: string, concernId: string): void {
  if (ioInstance) {
    ioInstance.to(`room:${householdId}`).emit('concern:shared', {
      householdId,
      concernId,
      timestamp: new Date().toISOString(),
    });
  }
}

export function initSocketServer(httpServer: HttpServer): SocketIoServer {
  const io = new SocketIoServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    path: '/socket.io',
  });

  ioInstance = io;

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      let token: string | undefined = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers.cookie) {
        const parsed = cookie.parse(socket.handshake.headers.cookie);
        token = parsed[ACCESS_COOKIE_NAME];
      }

      if (!token && socket.handshake.headers.authorization?.startsWith('Bearer ')) {
        token = socket.handshake.headers.authorization.split(' ')[1];
      }

      if (token) {
        const payload = verifyAccessToken(token);
        // Fetch full user details from DB to get householdId and name
        const dbUser = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, role: true, householdId: true },
        });

        if (dbUser) {
          socket.data.user = {
            userId: dbUser.id,
            name: dbUser.name,
            role: dbUser.role as 'LEARNER' | 'PARENT' | 'COUNSELLOR',
            householdId: dbUser.householdId || undefined,
          };
        }
      }

      // If no valid user token, create demo guest session
      if (!socket.data.user) {
        const role = socket.handshake.auth?.role || 'LEARNER';
        const name = socket.handshake.auth?.name || (role === 'PARENT' ? 'Demo Parent' : 'Demo Learner');
        const householdId = socket.handshake.auth?.householdId;
        socket.data.user = {
          userId: `guest-${randomUUID().slice(0, 8)}`,
          name,
          role: role as 'LEARNER' | 'PARENT' | 'COUNSELLOR',
          householdId,
        };
      }

      next();
    } catch (err) {
      logger.warn({ error: err }, 'Socket connection auth warning, continuing with guest profile');
      const role = 'LEARNER';
      socket.data.user = {
        userId: `guest-${randomUUID().slice(0, 8)}`,
        name: 'Guest Learner',
        role,
      };
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: SocketUser = socket.data.user;
    logger.info({ userId: user.userId, role: user.role }, 'Client connected to Joint Room Socket');

    let currentHouseholdId: string | null = null;

    // 1. Join room
    socket.on('join-room', async (data: { householdId: string }) => {
      const { householdId } = data;
      if (!householdId) return;

      currentHouseholdId = householdId;
      const roomKey = `room:${householdId}`;
      await socket.join(roomKey);

      // Add to participants
      if (!roomParticipants.has(householdId)) {
        roomParticipants.set(householdId, new Map());
      }
      const pMap = roomParticipants.get(householdId)!;
      pMap.set(user.userId, {
        userId: user.userId,
        name: user.name,
        role: user.role,
        joinedAt: new Date().toISOString(),
      });

      // Initialize message history if needed
      if (!roomMessageHistory.has(householdId)) {
        // Add a welcoming facilitator message
        roomMessageHistory.set(householdId, [
          {
            id: `sys-welcome-${householdId}`,
            householdId,
            senderId: 'saathi-ai',
            senderName: 'SAATHI Facilitator',
            senderRole: 'AI',
            text: 'Welcome to your Joint Counselling Session. Share concerns, review verified trades, or ask questions to bridge family goals.',
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      const participants = Array.from(pMap.values());
      const messages = roomMessageHistory.get(householdId) || [];

      // Send room state to the joining user
      socket.emit('room:joined', {
        householdId,
        participants,
        messages,
      });

      // Notify others in the room
      socket.to(roomKey).emit('room:user-joined', {
        userId: user.userId,
        name: user.name,
        role: user.role,
        joinedAt: new Date().toISOString(),
      });

      logger.info({ householdId, userId: user.userId }, 'User joined joint room');
    });

    // 2. Chat message
    socket.on('chat:send', async (data: { householdId: string; text: string }) => {
      const { householdId, text } = data;
      if (!householdId || !text || !text.trim()) return;

      const roomKey = `room:${householdId}`;
      const trimmedText = text.trim();

      const userMessage: JointChatMessage = {
        id: randomUUID(),
        householdId,
        senderId: user.userId,
        senderName: user.name,
        senderRole: user.role,
        text: trimmedText,
        createdAt: new Date().toISOString(),
      };

      // Store in room history (keep last 50)
      if (!roomMessageHistory.has(householdId)) {
        roomMessageHistory.set(householdId, []);
      }
      const history = roomMessageHistory.get(householdId)!;
      history.push(userMessage);
      if (history.length > 50) {
        history.shift();
      }

      // Broadcast message to everyone in the room
      io.to(roomKey).emit('chat:message', userMessage);

      // Check if message is addressed to AI (@ai, @saathi, or asks a question ending in '?')
      const lowerText = trimmedText.toLowerCase();
      const isAiQuery =
        lowerText.startsWith('@ai') ||
        lowerText.startsWith('@saathi') ||
        lowerText.includes('saathi') ||
        lowerText.includes('साथी') ||
        lowerText.includes('salary') ||
        lowerText.includes('वेतन') ||
        lowerText.includes('stipend') ||
        lowerText.includes('electrician') ||
        lowerText.includes('solar');

      if (isAiQuery) {
        // Fetch household details for context
        const household = await prisma.household.findUnique({
          where: { id: householdId },
        });

        // Trigger typing indicator for AI
        io.to(roomKey).emit('chat:user-typing', {
          householdId,
          userId: 'saathi-ai',
          userName: 'SAATHI Facilitator',
          isTyping: true,
        });

        try {
          const cleanQuery = trimmedText.replace(/^@(ai|saathi)\s*/i, '');
          const aiResponse = await groundedMockAdapter.query({
            query: cleanQuery,
            language: 'en',
            householdContext: household
              ? {
                  householdId: household.id,
                  state: household.state,
                  district: household.district,
                  block: household.block,
                  incomeBand: household.incomeBand,
                  learnerClassLevel: household.learnerClassLevel,
                }
              : undefined,
          });

          const aiMessage: JointChatMessage = {
            id: randomUUID(),
            householdId,
            senderId: 'saathi-ai',
            senderName: 'SAATHI AI Facilitator',
            senderRole: 'AI',
            text: aiResponse.answerEn,
            createdAt: new Date().toISOString(),
            citations: aiResponse.citations,
          };

          history.push(aiMessage);
          if (history.length > 50) {
            history.shift();
          }

          io.to(roomKey).emit('chat:user-typing', {
            householdId,
            userId: 'saathi-ai',
            userName: 'SAATHI Facilitator',
            isTyping: false,
          });

          io.to(roomKey).emit('chat:message', aiMessage);
        } catch (err) {
          logger.error({ error: err }, 'Failed to generate AI response in socket chat');
          io.to(roomKey).emit('chat:user-typing', {
            householdId,
            userId: 'saathi-ai',
            userName: 'SAATHI Facilitator',
            isTyping: false,
          });
        }
      }
    });

    // 3. Typing event
    socket.on('chat:typing', (data: { householdId: string; isTyping: boolean }) => {
      const { householdId, isTyping } = data;
      if (!householdId) return;

      const event: UserTypingEvent = {
        householdId,
        userId: user.userId,
        userName: user.name,
        isTyping,
      };

      socket.to(`room:${householdId}`).emit('chat:user-typing', event);
    });

    // 4. Leave room
    socket.on('leave-room', (data: { householdId: string }) => {
      const { householdId } = data;
      if (!householdId) return;

      socket.leave(`room:${householdId}`);
      if (roomParticipants.has(householdId)) {
        roomParticipants.get(householdId)!.delete(user.userId);
      }

      socket.to(`room:${householdId}`).emit('room:user-left', {
        userId: user.userId,
        name: user.name,
      });
    });

    // 5. WebRTC Live Video Counselling Signaling
    socket.on('webrtc:join', async (data: { roomId: string }) => {
      const { roomId } = data;
      if (!roomId) return;
      const callRoomKey = `call:${roomId}`;
      await socket.join(callRoomKey);

      const clients = await io.in(callRoomKey).allSockets();
      if (clients.size >= 2) {
        io.to(callRoomKey).emit('webrtc:ready', { roomId, participantCount: clients.size });
      }
      logger.info({ roomId, userId: user.userId }, 'Peer joined WebRTC counselling call');
    });

    socket.on('webrtc:offer', (data: { roomId: string; sdp: unknown }) => {
      socket.to(`call:${data.roomId}`).emit('webrtc:offer', {
        sdp: data.sdp,
        senderId: user.userId,
      });
    });

    socket.on('webrtc:answer', (data: { roomId: string; sdp: unknown }) => {
      socket.to(`call:${data.roomId}`).emit('webrtc:answer', {
        sdp: data.sdp,
        senderId: user.userId,
      });
    });

    socket.on('webrtc:ice-candidate', (data: { roomId: string; candidate: unknown }) => {
      socket.to(`call:${data.roomId}`).emit('webrtc:ice-candidate', {
        candidate: data.candidate,
        senderId: user.userId,
      });
    });

    socket.on('webrtc:toggle-mode', (data: { roomId: string; mode: 'VIDEO' | 'AUDIO_ONLY' }) => {
      socket.to(`call:${data.roomId}`).emit('webrtc:mode-changed', {
        mode: data.mode,
        senderId: user.userId,
      });
    });

    socket.on('webrtc:leave', (data: { roomId: string }) => {
      socket.leave(`call:${data.roomId}`);
      socket.to(`call:${data.roomId}`).emit('webrtc:peer-left', {
        userId: user.userId,
      });
    });

    // 6. Disconnect
    socket.on('disconnect', () => {

      if (currentHouseholdId && roomParticipants.has(currentHouseholdId)) {
        roomParticipants.get(currentHouseholdId)!.delete(user.userId);
        socket.to(`room:${currentHouseholdId}`).emit('room:user-left', {
          userId: user.userId,
          name: user.name,
        });
      }
      logger.info({ userId: user.userId }, 'Client disconnected from Joint Room Socket');
    });
  });

  return io;
}

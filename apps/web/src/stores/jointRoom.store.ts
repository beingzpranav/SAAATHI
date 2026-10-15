import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type {
  JointChatMessage,
  RoomParticipant,
  UserTypingEvent,
  UserProfile,
} from '@saathi/shared';

interface JointRoomState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  householdId: string | null;
  participants: RoomParticipant[];
  messages: JointChatMessage[];
  typingUsers: Record<string, string>; // userId -> userName
  connect: (householdId: string, user: UserProfile | null) => void;
  disconnect: () => void;
  sendMessage: (text: string) => void;
  sendTyping: (isTyping: boolean) => void;
  addOptimisticMessage: (message: JointChatMessage) => void;
}

export const useJointRoomStore = create<JointRoomState>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  householdId: null,
  participants: [],
  messages: [],
  typingUsers: {},

  connect: (householdId: string, user: UserProfile | null) => {
    const existingSocket = get().socket;
    if (existingSocket?.connected && get().householdId === householdId) {
      return;
    }

    if (existingSocket) {
      existingSocket.disconnect();
    }

    set({ isConnecting: true, householdId });

    // Use current origin in dev/prod proxy
    const socket = io('/', {
      path: '/socket.io',
      withCredentials: true,
      auth: {
        householdId,
        role: user?.role || 'LEARNER',
        name: user?.name || (user?.role === 'PARENT' ? 'Parent' : 'Learner'),
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      set({ isConnected: true, isConnecting: false });
      socket.emit('join-room', { householdId });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('connect_error', () => {
      set({ isConnecting: false, isConnected: false });
    });

    socket.on(
      'room:joined',
      (data: { householdId: string; participants: RoomParticipant[]; messages: JointChatMessage[] }) => {
        set({
          participants: data.participants,
          messages: data.messages,
        });
      },
    );

    socket.on('room:user-joined', (participant: RoomParticipant) => {
      set((state) => {
        const exists = state.participants.some((p) => p.userId === participant.userId);
        if (exists) return state;
        return { participants: [...state.participants, participant] };
      });
    });

    socket.on('room:user-left', (data: { userId: string; name: string }) => {
      set((state) => ({
        participants: state.participants.filter((p) => p.userId !== data.userId),
      }));
    });

    socket.on('chat:message', (message: JointChatMessage) => {
      set((state) => {
        // Prevent duplicate messages if added optimistically
        const exists = state.messages.some((m) => m.id === message.id);
        if (exists) return state;
        return { messages: [...state.messages, message] };
      });
    });

    socket.on('chat:user-typing', (event: UserTypingEvent) => {
      set((state) => {
        const next = { ...state.typingUsers };
        if (event.isTyping) {
          next[event.userId] = event.userName;
        } else {
          delete next[event.userId];
        }
        return { typingUsers: next };
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket, householdId } = get();
    if (socket) {
      if (householdId) {
        socket.emit('leave-room', { householdId });
      }
      socket.disconnect();
    }
    set({
      socket: null,
      isConnected: false,
      isConnecting: false,
      householdId: null,
      participants: [],
      messages: [],
      typingUsers: {},
    });
  },

  sendMessage: (text: string) => {
    const { socket, householdId } = get();
    if (socket?.connected && householdId && text.trim()) {
      socket.emit('chat:send', { householdId, text: text.trim() });
    }
  },

  sendTyping: (isTyping: boolean) => {
    const { socket, householdId } = get();
    if (socket?.connected && householdId) {
      socket.emit('chat:typing', { householdId, isTyping });
    }
  },

  addOptimisticMessage: (message: JointChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
}));

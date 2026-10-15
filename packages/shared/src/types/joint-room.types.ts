import type { GroundedCitation } from './ai.types.js';

export type ChatSenderRole = 'LEARNER' | 'PARENT' | 'COUNSELLOR' | 'SYSTEM' | 'AI';

export interface JointChatMessage {
  id: string;
  householdId: string;
  senderId: string;
  senderName: string;
  senderRole: ChatSenderRole;
  text: string;
  createdAt: string;
  citations?: GroundedCitation[];
}

export interface UserTypingEvent {
  householdId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface RoomParticipant {
  userId: string;
  name: string;
  role: 'LEARNER' | 'PARENT' | 'COUNSELLOR';
  joinedAt: string;
}

export interface RoomStateResponse {
  householdId: string;
  participants: RoomParticipant[];
  messages: JointChatMessage[];
  activeTopic?: string;
}

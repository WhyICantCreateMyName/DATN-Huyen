export enum MessageSenderType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  BOT = 'BOT'
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  senderType: MessageSenderType;
  isRead: boolean;
  isSent?: boolean;
  readAt?: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Conversation {
  id: string;
  partner: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

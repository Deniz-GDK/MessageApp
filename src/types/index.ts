export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  chatId: string;
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string;
  participants: User[];
  lastMessage?: Message;
}

export interface GameState {
  board: Array<string | null>;
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
}
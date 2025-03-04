
export interface TelegramUser {
  username: string;
  id?: number;
}

export interface Order {
  id: string;
  courseId: number;
  courseTitle: string;
  orderDate: string;
  status: 'pending' | 'completed';
  telegramUsername: string;
}

export interface PurchaseHistory {
  username: string;
  purchases: {
    timestamp: number;
    courseId: number;
  }[];
  cooldownUntil?: number;
}

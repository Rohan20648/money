export type User = {
  username: string;
  userType: "student" | "adult";
};

export type Portfolio = {
  income: number;
  recurring: number;
  leisure: number;
  savings: number;
  emergency: number;
  investment: number;
  borrow?: number;
  score: number;
};

export const users: Map<string, User> = new Map();
export const portfolios: Map<string, Portfolio> = new Map();

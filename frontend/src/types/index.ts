export type UserRole = 'PricingManager' | 'BusinessAnalyst' | 'SalesTeam' | 'Executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentPrice: number;
  optimalPrice: number;
  stock: number;
  demandTrend: 'Increasing' | 'Stable' | 'Decreasing';
}

export interface SalesAnalytics {
  date: string;
  revenue: number;
  unitsSold: number;
}
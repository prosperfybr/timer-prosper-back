export interface AdminStatsDTO {
  systemStats: SystemStats;
  establishmentsByPlan: EstablishmentsByPlan;
  recentEstablishments: RecentEstablishment[];
  growthData: GrowthData[];
}

export interface SystemStats {
  totalEstablishments: number;
  totalUsers: number;
  totalAppointments: number;
  monthlyRevenue: number;
  newEstablishmentsThisMonth: number;
  newUsersThisWeek: number;
  activeSubscriptions: number;
  churnRate: number;
}

export interface EstablishmentsByPlan {
  basic: number;
  professional: number;
  enterprise: number;
}

export interface RecentEstablishment {
  id: string;
  tradeName: string;
  ownerName: string;
  planId: string;
  status: 'active' | 'trial' | 'inactive';
  createdAt: string;
  city: string;
}

export interface GrowthData {
  month: string;
  establishments: number;
  users: number;
  revenue: number;
}
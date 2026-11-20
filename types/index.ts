export type WaitlistRole = "earn" | "send" | "both";

export interface WaitlistEntry {
  spot: number;
  name: string;
  identifier: string; // normalized phone (09.../07...) or email
  role: WaitlistRole;
  area?: string;
  createdAt: string;
}

export interface WaitlistSubmissionRequest {
  name: string;
  identifier: string;
  role: WaitlistRole;
  area?: string;
}

export interface WaitlistSubmissionResponse {
  success: boolean;
  alreadyRegistered: boolean;
  spot: number;
  name: string;
  role: WaitlistRole;
  identifier?: string;
  area?: string;
  message?: string;
  error?: string;
}

export interface WaitlistStatusResponse {
  success: boolean;
  found: boolean;
  spot?: number;
  name?: string;
  identifier?: string;
  role?: WaitlistRole;
  area?: string;
  createdAt?: string;
  message?: string;
  error?: string;
}

export interface WaitlistStatsResponse {
  success: boolean;
  totalCount: number;
  displayCount: string;
}

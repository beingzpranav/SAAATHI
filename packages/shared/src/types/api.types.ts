/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: ApiMeta;
}

/**
 * Standard API Metadata
 */
export interface ApiMeta {
  timestamp?: string;
  requestId?: string;
  cursor?: string;
  hasNextPage?: boolean;
  total?: number;
}

/**
 * Standard API Error Detail
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/**
 * Standard API Error Envelope
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId?: string;
  };
}

/**
 * Health and Readiness Check Payload
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  checks?: {
    database?: 'connected' | 'disconnected';
    memory?: string;
  };
}

// Standardized API success response pattern for all endpoints
export interface ApiSuccessResponse<TData = any> {
  data: TData;
  success: true;
  message?: string;
}

// Standardized API error response pattern for all endpoints
export interface ApiErrorResponse<TData = any> {
  error: string;
  success: false;
  message?: string;
  data?: TData;
}

// Standardized API response pattern for all endpoints.
export type ApiResponse<TData = any>
  = | ApiSuccessResponse<TData>
    | ApiErrorResponse<TData>;

// Rate limiting types
export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
  retryAfter: number | null;
}

// Extended error response that includes rate limit information
export interface RateLimitedApiResponse extends ApiErrorResponse {
  rateLimitInfo: RateLimitInfo;
}

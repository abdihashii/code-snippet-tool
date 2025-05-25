// Standardized API success response pattern for all endpoints
export interface ApiSuccessResponse<TData = any> {
  data: TData;
  success: true;
  message?: string;
}

// Standardized API error response pattern for all endpoints
export interface ApiErrorResponse {
  error: string;
  success: false;
  message?: string;
}

// Standardized API response pattern for all endpoints.
export type ApiResponse<TData = any> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse;

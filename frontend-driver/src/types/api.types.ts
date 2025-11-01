export type ApiErrorCode =
  | 'LIMIT_REACHED'
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_LICENSE'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  code?: ApiErrorCode;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

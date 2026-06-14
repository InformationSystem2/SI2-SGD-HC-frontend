export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthState {
  accessToken: string | null;
  username: string | null;
  roles: string[] | null;
  expiresAt: number | null;  // Date.now() + expiresIn, para saber si venció
  tenantId: string | null; 
  loading: boolean;
  error: string | null;
  permissions: string[] | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyRecoveryCodeRequest {
  email: string;
  code: string;
  newPassword: string;
}

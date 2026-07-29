import api from "../api/axios";

// ─── Request / Response DTOs ────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;       // Backend RegisterRequest.name  (NOT fullName)
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// ─── Auth Service ────────────────────────────────────────────────────────────

/**
 * POST /api/users/register
 * Sends { name, email, password }
 * Returns { id, name, email } on success
 */
const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/users/register", userData);
  return response.data;
};

/**
 * POST /api/auth/login
 * Sends { email, password }
 * Returns { token }; token is stored in localStorage automatically
 */
const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", credentials);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
};

const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

const authService = {
  register,
  login,
  logout,
  isLoggedIn,
};

export default authService;
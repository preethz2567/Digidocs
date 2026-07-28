import api from "../api/axios";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

const register = async (userData: RegisterRequest) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

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
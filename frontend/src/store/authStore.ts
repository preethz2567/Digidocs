import { create } from "zustand";
import authService from "../services/authService";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("token"),

  login: async (credentials) => {
    await authService.login(credentials);
    set({ isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false });
  },
}));

export default useAuthStore;
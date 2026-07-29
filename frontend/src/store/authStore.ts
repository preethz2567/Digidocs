import { create } from "zustand";
import authService from "../services/authService";

interface LoginRequest {
  email: string;
  password: string;
}

interface UserData {
  name: string;
  email: string;
  profileImage: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("token"),
  user: null,

  login: async (credentials) => {
    try {
      await authService.login(credentials);
      set({ isAuthenticated: true });
      useAuthStore.getState().fetchUser();
    } catch (error) {
      set({ isAuthenticated: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false, user: null });
  },

  fetchUser: async () => {
    try {
      const { default: userService } = await import("../services/userService");
      const profile = await userService.getProfile();
      let avatarUrl = null;
      if (profile.profileImage) {
        try {
          avatarUrl = await userService.getAvatarUrl();
        } catch {
          // ignore avatar fetch errors
        }
      }
      set({ user: { ...profile, avatarUrl } });
    } catch {
      // ignore
    }
  },
}));

export default useAuthStore;
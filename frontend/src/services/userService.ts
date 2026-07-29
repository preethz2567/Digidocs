import api from "../api/axios";

interface UpdateProfileRequest {
  name: string;
  email: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

const updateProfile = async (
  profile: UpdateProfileRequest
) => {
  const response = await api.put(
    "/users/profile",
    profile
  );

  return response.data;
};

const changePassword = async (
  passwords: ChangePasswordRequest
) => {
  const response = await api.put(
    "/users/change-password",
    passwords
  );

  return response.data;
};

const userService = {
  getProfile,
  updateProfile,
  changePassword,
};

export default userService;
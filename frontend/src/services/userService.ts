import api from "../api/axios";

interface UpdateProfileRequest {
  name: string;
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

const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": null as any,
    },
    transformRequest: (data, headers) => {
      if (headers) {
        delete headers['Content-Type'];
        delete headers.common?.['Content-Type'];
      }
      return data;
    },
  });
  return response.data;
};

const deleteAvatar = async () => {
  const response = await api.delete("/users/me/avatar");
  return response.data;
};

const getAvatarUrl = async () => {
  const response = await api.get("/users/me/avatar", { responseType: "blob" });
  return URL.createObjectURL(response.data);
};

const userService = {
  getProfile,
  changePassword,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getAvatarUrl,
};

export default userService;
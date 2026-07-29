import api from "../api/axios";

const getDocuments = async (sort = "date") => {
  const response = await api.get(`/documents?sort=${sort}`);
  return response.data;
};

const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const downloadDocument = async (id: number) => {
  const response = await api.get(`/documents/${id}`, {
    responseType: "blob",
  });

  return response.data;
};

const deleteDocument = async (id: number) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

const renameDocument = async (
  id: number,
  originalFileName: string
) => {
  const response = await api.put(`/documents/${id}`, {
    newName: originalFileName,
  });

  return response.data;
};

const searchDocuments = async (keyword: string) => {
  const response = await api.get(
    `/documents/search?keyword=${keyword}`
  );

  return response.data;
};

const getMetadata = async (id: number) => {
  const response = await api.get(`/documents/${id}/metadata`);
  return response.data;
};

const shareDocument = async (id: number) => {
  const response = await api.post(`/documents/${id}/share`);
  return response.data;
};

const revokeShare = async (id: number) => {
  const response = await api.delete(`/documents/${id}/share`);
  return response.data;
};

const documentService = {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  renameDocument,
  searchDocuments,
  getMetadata,
  shareDocument,
  revokeShare,
};

export default documentService;
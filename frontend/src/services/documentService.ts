import api from "../api/axios";
import axios from "axios";

// Axios instance without auth interceptor for public endpoints
const publicApi = axios.create({
  baseURL: "http://localhost:8081/api",
});


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

const toggleStar = async (id: number) => {
  const response = await api.put(`/documents/${id}/star`);
  return response.data;
};

const downloadMultipleAsZip = async (ids: number[]) => {
  const response = await api.get(`/documents/download-zip?ids=${ids.join(",")}`, {
    responseType: "blob",
  });
  return response.data;
};

const getDeletedDocuments = async (sort = "date") => {
  const response = await api.get(`/documents/trash?sort=${sort}`);
  return response.data;
};

const restoreDocument = async (id: number) => {
  const response = await api.put(`/documents/${id}/restore`);
  return response.data;
};

const permanentlyDeleteDocument = async (id: number) => {
  const response = await api.delete(`/documents/${id}/permanent`);
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
  toggleStar,
  downloadMultipleAsZip,
  getDeletedDocuments,
  restoreDocument,
  permanentlyDeleteDocument,
};

/**
 * Fetch a publicly shared document using its token.
 * Returns the file Blob and the filename parsed from Content-Disposition.
 */
export const getSharedDocument = async (token: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await publicApi.get(`/documents/share/${token}`, {
    responseType: "blob",
  });

  const disposition: string = response.headers["content-disposition"] || "";
  let filename = "document";
  const match = disposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;"'\n]+)/i);
  if (match && match[1]) {
    filename = decodeURIComponent(match[1].trim());
  }

  return { blob: response.data, filename };
};

export default documentService;
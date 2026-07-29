import api from "../api/axios";
import publicApi from "../api/publicApi";

const getDocuments = async (sort = "date") => {
  const response = await api.get(`/documents?sort=${sort}`);
  return response.data;
};

const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      // Explicitly unset the global Content-Type so the browser can
      // set multipart/form-data with the correct boundary automatically.
      "Content-Type": null as any,
    },
    transformRequest: (data, headers) => {
      // Remove the header so it is not sent at all.
      if (headers) {
        delete headers['Content-Type'];
        delete headers.common?.['Content-Type'];
      }
      return data;
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

const getSharedDocument = async (token: string) => {
  const response = await publicApi.get(`/documents/share/${token}`, {
    responseType: "blob",
  });
  
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'Shared_Document';
  if (contentDisposition && contentDisposition.includes('filename=')) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }
  
  return { blob: response.data as Blob, filename };
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
  getSharedDocument,
};

export default documentService;
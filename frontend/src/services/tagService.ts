import api from "../api/axios";
import { TagData } from "../components/ui/DocumentTable";

const getAllTags = async () => {
  const response = await api.get('/tags');
  return response.data;
};

const createTag = async (tag: Omit<TagData, 'id'>) => {
  const response = await api.post('/tags', tag);
  return response.data;
};

const deleteTag = async (tagId: number) => {
  await api.delete(`/tags/${tagId}`);
};

const assignTag = async (documentId: number, tagId: number) => {
  await api.post(`/documents/${documentId}/tags/${tagId}`);
};

const removeTag = async (documentId: number, tagId: number) => {
  await api.delete(`/documents/${documentId}/tags/${tagId}`);
};

export default {
  getAllTags,
  createTag,
  deleteTag,
  assignTag,
  removeTag
};

import api from './api';

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

// Get subcategories
export const getSubcategories = async (parentId) => {
  try {
    const response = await api.get(`/categories/subcategories/${parentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subcategories for parent ${parentId}:`, error);
    throw error;
  }
};

// Get categories by gender
export const getCategoriesByGender = async (gender) => {
  try {
    const response = await api.get(`/categories/gender/${gender}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categories for gender ${gender}:`, error);
    throw error;
  }
};

// Get category tree structure
export const getCategoryTree = async () => {
  try {
    const response = await api.get('/categories/tree');
    return response.data;
  } catch (error) {
    console.error('Error fetching category tree:', error);
    throw error;
  }
};

// Get category tree by gender
export const getCategoryTreeByGender = async (gender) => {
  try {
    const response = await api.get(`/categories/tree/gender/${gender}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category tree for gender ${gender}:`, error);
    throw error;
  }
};
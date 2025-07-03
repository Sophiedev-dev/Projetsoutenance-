export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function for API endpoints
export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};


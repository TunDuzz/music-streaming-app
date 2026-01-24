
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5125/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'CÃ³ lá»—i xáº£y ra' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const songsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Songs`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Songs/${id}`);
    return handleResponse(response);
  },

  getByArtistId: async (artistId) => {
    const response = await fetch(`${API_BASE_URL}/Songs/artist/${artistId}`);
    return handleResponse(response);
  },

  create: async (songData) => {
    const response = await fetch(`${API_BASE_URL}/Songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songData),
    });
    return handleResponse(response);
  },

  update: async (id, songData) => {
    const response = await fetch(`${API_BASE_URL}/Songs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Songs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  },
};

export const artistsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Artists`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Artists/${id}`);
    return handleResponse(response);
  },

  create: async (artistData) => {
    const response = await fetch(`${API_BASE_URL}/Artists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artistData),
    });
    return handleResponse(response);
  },

  update: async (id, artistData) => {
    const response = await fetch(`${API_BASE_URL}/Artists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artistData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Artists/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  },
};

export const usersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Users`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`);
    return handleResponse(response);
  },

  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/Users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  update: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  },
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default {
  songs: songsApi,
  artists: artistsApi,
  users: usersApi,
};

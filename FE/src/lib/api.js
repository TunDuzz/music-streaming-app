const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5125/api';

const handleResponseSafe = async (response) => {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const error = await response.json();
            errorMessage = error.message || error.title || JSON.stringify(error);
        } catch (e) {
            // Try getting text response
            try {
                const textError = await response.text();
                if (textError) errorMessage = textError;
            } catch (textEx) {
                errorMessage = `HTTP error! status: ${response.status}`;
            }
        }
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    try {
        return await response.json();
    } catch (e) {
        return null;
    }
};

// Add token to requests
const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('token');
    const headers = {};

    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

export const songsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/Songs`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    search: async (query) => {
        const response = await fetch(`${API_BASE_URL}/Songs/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Songs/${id}`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    create: async (songData) => {
        const response = await fetch(`${API_BASE_URL}/Songs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(songData),
        });
        return handleResponseSafe(response);
    },

    createWithUpload: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/Songs/with-upload`, {
            method: 'POST',
            headers: getHeaders(true), // Multipart
            body: formData,
        });
        return handleResponseSafe(response);
    },

    update: async (id, songData) => {
        const response = await fetch(`${API_BASE_URL}/Songs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(songData),
        });
        return handleResponseSafe(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Songs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    toggleLike: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Songs/${id}/like`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    getLikedIds: async () => {
        const response = await fetch(`${API_BASE_URL}/Songs/liked`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    }
};

export const artistsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/Artists`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Artists/${id}`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Artists`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },

    createWithUpload: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/Artists/with-upload`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData,
        });
        return handleResponseSafe(response);
    },

    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Artists/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Artists/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    uploadImages: async (id, files) => {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));

        const response = await fetch(`${API_BASE_URL}/Artists/${id}/images`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData
        });
        return handleResponseSafe(response);
    }
};

export const albumsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/Album`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Album/${id}`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Album`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Album/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Album/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    uploadImage: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/Album/${id}/image`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData
        });
        return handleResponseSafe(response);
    }
};

// Genres API
export const genresApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/Genres`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Genres`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Genres/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Genres/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
};

export const usersApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/Users`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    }
};

export const authApi = {
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return handleResponseSafe(response);
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/Auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return handleResponseSafe(response);
    },
};


export const playlistsApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/Playlist`, { // Updated to match likely Controller Route
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    getLiked: async () => {
        const response = await fetch(`${API_BASE_URL}/Playlist/liked`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    getMyPlaylists: async () => {
        const response = await fetch(`${API_BASE_URL}/Playlist/my-playlists`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Playlist/${id}`, {
            headers: getHeaders(),
            cache: 'no-store'
        });
        return handleResponseSafe(response);
    },
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Playlist`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Playlist/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponseSafe(response);
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Playlist/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    addSong: async (playlistId, songId) => {
        const response = await fetch(`${API_BASE_URL}/Playlist/${playlistId}/songs/${songId}`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    removeSong: async (playlistId, songId) => {
        const response = await fetch(`${API_BASE_URL}/Playlist/${playlistId}/songs/${songId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    },
    uploadImage: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/Playlist/${id}/image`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData
        });
        return handleResponseSafe(response);
    }
};

export const filesApi = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Default bucket 'music-app' or pass as arg if needed
        const response = await fetch(`${API_BASE_URL}/Files/upload`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData
        });

        return handleResponseSafe(response);
    }
};

export const searchApi = {
    search: async (query) => {
        const response = await fetch(`${API_BASE_URL}/Search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders(),
        });
        return handleResponseSafe(response);
    }
};

export const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

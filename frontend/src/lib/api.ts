import api from './axios';

// API base URL - should be just the server, not including /api/public
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8010';
const API_URL = `${API_BASE_URL}/api/public`;

export async function getHomeData() {
    try {
        const res = await fetch(`${API_URL}/home`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }
        });
        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        return json;
    } catch (error: any) {
        console.error('Failed to fetch home data:', {
            url: `${API_URL}/home`,
            error: error.message,
        });
        throw error;
    }
}

export async function getCategoryData(slug: string, page = 1) {
    try {
        const res = await fetch(`${API_URL}/categories/${slug}?page=${page}`, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;

        const contentType = res.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
            console.error('API returned non-JSON response:', await res.text());
            return null;
        }

        return res.json();
    } catch (error: any) {
        console.error('Failed to fetch category data:', error.message);
        return null;
    }
}

export async function getAuthorData(slug: string, page = 1) {
    try {
        const res = await fetch(`${API_URL}/authors/${slug}?page=${page}`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error: any) {
        console.error('Failed to fetch author data:', error.message);
        return null;
    }
}

export async function getPosts(page = 1) {
    try {
        const res = await fetch(`${API_URL}/posts?page=${page}`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 } // ISR every 60 seconds
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
    } catch (error: any) {
        console.error('Failed to fetch posts:', error.message);
        throw error;
    }
}

export async function getPostBySlug(slug: string) {
    try {
        const res = await fetch(`${API_URL}/posts/${slug}`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error: any) {
        console.error(`Failed to fetch post ${slug}:`, error.message);
        return null;
    }
}

export async function getCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`, {
            cache: 'no-store'
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error: any) {
        console.error('Failed to fetch categories:', error.message);
        return { data: [] };
    }
}

export async function getTrendingPosts() {
    try {
        const res = await fetch(`${API_URL}/trending`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error: any) {
        console.error('Failed to fetch trending posts:', error.message);
        return { data: [] };
    }
}

export async function searchPosts(q: string, page = 1) {
    try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}&page=${page}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) throw new Error('Search failed');
        return res.json();
    } catch (error: any) {
        console.error('Search failed:', error.message);
        throw error;
    }
}

export async function getComments(slug: string) {
    // Use the axios instance to include Bearer token if available (for admins to see pending)
    return api.get(`/api/public/posts/${slug}/comments`);
}

export async function postComment(slug: string, data: any) {
    return api.post(`/api/public/posts/${slug}/comments`, data);
}

// Author Dashboard APIs
export async function getAuthorStats() {
    return api.get('/api/author/stats');
}

export async function getAuthorPosts(page = 1, filters = {}) {
    return api.get('/api/author/posts', {
        params: { page, ...filters }
    });
}

export async function getAuthorPost(id: string | number) {
    return api.get(`/api/author/posts/${id}`);
}

export async function getAuthorProfile() {
    return api.get('/api/author/profile');
}

export async function updateAuthorProfile(data: any) {
    return api.put('/api/author/profile', data);
}

export async function createAuthorPost(data: any) {
    return api.post('/api/author/posts', data);
}

export async function updateAuthorPost(id: string | number, data: any) {
    return api.put(`/api/author/posts/${id}`, data);
}

export async function deleteAuthorPost(id: string | number) {
    return api.delete(`/api/author/posts/${id}`);
}

export async function submitAuthorPost(id: string | number) {
    return api.post(`/api/author/posts/${id}/submit`);
}

export async function getMenu(location: string) {
    try {
        const res = await fetch(`${API_URL}/menus/${location}`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error: any) {
        console.error(`Failed to fetch menu ${location}:`, error.message);
        return null;
    }
}

export async function getPageData(slug: string) {
    try {
        const res = await fetch(`${API_URL}/pages/${slug}`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error: any) {
        console.error(`Failed to fetch page ${slug}:`, error.message);
        return null;
    }
}


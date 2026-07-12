(function () {
    const TOKEN_KEY = "adminToken";

    function getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            console.warn("localStorage unavailable");
            return null;
        }
    }

    function getApiBase() {
        if (window.API_BASE) {
            return window.API_BASE;
        }

        const isVercel = window.location.hostname.includes('vercel.app') ||
                        window.location.hostname.includes('vercel.com');
        
        if (isVercel) {
            return window.location.origin;
        }

        return 'http://localhost:5000';
    }

    try {
        localStorage.setItem("test", "1");
        localStorage.removeItem("test");
    } catch {
        console.warn("localStorage blocked — token will not persist");
    }

    function setToken(token) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            console.warn("localStorage unavailable — token not persisted");
        }
    }

    function logout() {
        try { localStorage.removeItem(TOKEN_KEY); } catch {}
        window.location.href = "login.html";
    }

    async function apiFetch(url, options = {}) {
        const token = getToken();
        options.headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        
        try {
            const res = await fetch(url, options);
            if (res.status === 401) {
                logout();
                throw new Error('Unauthorized');
            }
            return res;
        } catch (err) {
            console.error('API fetch error:', err);
            throw err;
        }
    }

    const API_BASE = getApiBase();
    console.log('API_BASE resolved to:', API_BASE);

    const page = location.pathname.split("/").pop();
    const publicPages = ["login.html", ""];
    if (!publicPages.includes(page) && !getToken()) {
        window.location.href = "login.html";
    }

    window.adminAuth = { API: API_BASE, getToken, setToken, logout, apiFetch };
    console.log("adminAuth loaded successfully");
})();

(function () {
    const API_BASE = window.location.port === '5000' ? '' : (window.location.protocol === 'file:' ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}:5000`);
    const TOKEN_KEY = "adminToken";

    function getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }

    function setToken(token) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            console.warn("localStorage unavailable — token not persisted");
        }
    }

    function logout() {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            // ignore
        }
        window.location.href = "login.html";
    }

    // Authenticated fetch wrapper
    async function apiFetch(url, options = {}) {
        const token = getToken();
        options.headers = {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        const res = await fetch(url, options);
        if (res.status === 401) {
            logout();
        }
        return res;
    }

    // Redirect to login if not authenticated (protected pages only)
    const page = location.pathname.split("/").pop();
    const publicPages = ["login.html"];
    if (!publicPages.includes(page) && !getToken()) {
        window.location.href = "login.html";
    }

    // Expose only through window.adminAuth so pages can destructure freely
    // without colliding with global identifiers.
    window.adminAuth = { API: API_BASE, getToken, setToken, logout, apiFetch };
})();

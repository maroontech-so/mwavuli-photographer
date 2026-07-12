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

    let API_BASE;
    try {
        API_BASE = window.location.port === '5000'
            ? ''
            : (window.location.protocol === 'file:'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`);
    } catch {
        API_BASE = '/api';
        console.warn("Could not detect API_BASE, using relative path");
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
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        const res = await fetch(url, options);
        if (res.status === 401) {
            logout();
        }
        return res;
    }

    const page = location.pathname.split("/").pop();
    const publicPages = ["login.html"];
    if (!publicPages.includes(page) && !getToken()) {
        window.location.href = "login.html";
    }

    window.adminAuth = { API: API_BASE, getToken, setToken, logout, apiFetch };
    console.log("adminAuth loaded, API_BASE =", API_BASE);
})();

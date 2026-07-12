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

    // Frontend uses window.API_BASE if set (e.g. injected by hosting platform),
    // otherwise falls back to service-worker/domain-based detection.
    const API_BASE = window.API_BASE
        || (!window.location.port || window.location.port === '5000'
            ? ''
            : (window.location.protocol === 'file:'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`));

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
    console.log("adminAuth loaded, API_BASE =", API_BASE, "(override via window.API_BASE)");
})();

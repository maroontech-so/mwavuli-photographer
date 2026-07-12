(function () {
    console.log("login.js loaded");
    const adminAuth = window.adminAuth;
    console.log("window.adminAuth:", adminAuth);

    if (!adminAuth) {
        document.addEventListener("DOMContentLoaded", () => {
            const message = document.getElementById("message");
            if (message) {
                message.style.color = "red";
                message.textContent = "Auth module failed to load. Check console and script paths.";
            }
            console.error("window.adminAuth is undefined — auth.js did not load");
        });
        return;
    }

    const { API, setToken } = adminAuth;
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!form) {
        console.error("loginForm not found");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Login form submitted");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            message.style.color = "red";
            message.textContent = "Please enter both email and password.";
            return;
        }

        try {
            console.log("Fetching:", `${API}/api/admin/login`);
            const response = await fetch(`${API}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            console.log("Response status:", response.status);
            const data = await response.json().catch(() => ({}));
            console.log("Response data:", data);

            if (data.success && data.token) {
                try {
                    setToken(data.token);
                } catch (storageErr) {
                    console.error("Failed to persist token:", storageErr);
                    message.style.color = "red";
                    message.textContent = "Login succeeded but browser storage is blocked. Please allow localStorage.";
                    return;
                }
                console.log("Login successful, redirecting...");
                window.location.href = "dashboard.html";
            } else {
                message.style.color = "red";
                message.textContent = data.message || "Login failed.";
                console.log("Login failed:", data.message);
            }
        } catch (err) {
            message.style.color = "red";
            message.textContent = "Network error. Is the server running?";
            console.error("Login fetch error:", err);
        }
    });
})();

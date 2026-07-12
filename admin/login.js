const { API, setToken } = window.adminAuth;
const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.style.color = "red";
        message.textContent = "Please enter both email and password.";
        return;
    }

    try {
        const response = await fetch(`${API}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (data.success && data.token) {
            try {
                setToken(data.token);
            } catch (storageErr) {
                console.error("Failed to persist token:", storageErr);
                message.style.color = "red";
                message.textContent = "Login succeeded, but browser storage is blocked. Please allow cookies/localStorage.";
                return;
            }
            window.location.href = "dashboard.html";
        } else {
            message.style.color = "red";
            message.textContent = data.message || "Login failed.";
        }
    } catch (err) {
        message.style.color = "red";
        message.textContent = "Network error. Is the server running?";
    }
});

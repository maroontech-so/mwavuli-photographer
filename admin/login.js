const { API, setToken } = window.adminAuth;
const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success && data.token) {
            setToken(data.token);
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

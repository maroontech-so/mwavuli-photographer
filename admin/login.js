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
    const loginBtn = document.getElementById("loginBtn");

    if (!form) {
        console.error("loginForm not found");
        return;
    }

    let isSubmitting = false;

    if (message) {
        message.textContent = '';
        message.style.color = '';
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (isSubmitting) {
            console.log("Login already in progress, ignoring duplicate submit");
            return;
        }

        isSubmitting = true;
        if (loginBtn) loginBtn.classList.add('loading');
        console.log("Login form submitted");

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        
        if (!emailInput || !passwordInput) {
            if (message) {
                message.style.color = "red";
                message.textContent = "Form fields not found.";
            }
            isSubmitting = false;
            if (loginBtn) loginBtn.classList.remove('loading');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            if (message) {
                message.style.color = "red";
                message.textContent = "Please enter both email and password.";
            }
            isSubmitting = false;
            if (loginBtn) loginBtn.classList.remove('loading');
            return;
        }

        if (message) {
            message.textContent = "";
            message.style.color = "";
        }

        try {
            const loginUrl = `${API}/api/admin/login`;
            console.log("Fetching:", loginUrl);
            
            const response = await fetch(loginUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            console.log("Response status:", response.status);
            
            let data;
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                console.error("Invalid JSON response:", text);
                data = { success: false, message: "Server returned invalid response" };
            }
            
            console.log("Response data:", data);

            if (response.ok && data.success && data.token) {
                try {
                    setToken(data.token);
                    console.log("Token stored successfully");
                    
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 100);
                } catch (storageErr) {
                    console.error("Failed to persist token:", storageErr);
                    if (message) {
                        message.style.color = "red";
                        message.textContent = "Login succeeded but browser storage is blocked. Please allow localStorage.";
                    }
                    isSubmitting = false;
                    if (loginBtn) loginBtn.classList.remove('loading');
                }
            } else {
                if (message) {
                    message.style.color = "red";
                    message.textContent = data.message || "Login failed. Please check your credentials.";
                }
                console.log("Login failed:", data.message);
                isSubmitting = false;
                if (loginBtn) loginBtn.classList.remove('loading');
            }
        } catch (err) {
            console.error("Login fetch error:", err);
            if (message) {
                message.style.color = "red";
                message.textContent = "Network error. Is the server running?";
            }
            isSubmitting = false;
            if (loginBtn) loginBtn.classList.remove('loading');
        }
    });

    window.addEventListener('beforeunload', () => {
        isSubmitting = false;
    });
})();

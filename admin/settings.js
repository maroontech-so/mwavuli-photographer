(function () {
    const { API, apiFetch } = window.adminAuth;
    const form = document.getElementById("changePasswordForm");
    if (!form) return;

    const msg = document.getElementById("passwordMsg");
    const btn = document.getElementById("changePasswordBtn");

    function setMsg(text, type) {
        msg.textContent = text;
        msg.className = "form-msg" + (type ? " " + type : "");
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword.length < 6) {
            setMsg("New password must be at least 6 characters.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMsg("New passwords do not match.", "error");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Updating...";
        setMsg("", "");

        try {
            const res = await apiFetch(`${API}/api/admin/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMsg(data.message || "Password updated.", "success");
                if (window.showToast) window.showToast(data.message || "Password updated", "success");
                form.reset();
            } else {
                setMsg(data.message || "Could not update password.", "error");
            }
        } catch (err) {
            setMsg(err.message || "Network error. Is the server running?", "error");
        } finally {
            btn.disabled = false;
            btn.textContent = "Update Password";
        }
    });
})();

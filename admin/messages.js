const { API, apiFetch } = window.adminAuth;

async function loadMessages() {
    try {
        const response = await apiFetch(`${API}/api/messages`);
        const data = await response.json();
        const container = document.getElementById("messageContainer");
        container.innerHTML = "";

        const messages = data.messages || [];
        if (!messages.length) {
            container.innerHTML = "<p>No messages yet.</p>";
            return;
        }

        messages.forEach(m => {
            container.innerHTML += `
            <div class="message-card">
                <h3>${m.name}</h3>
                <p><strong>Email:</strong> ${m.email}</p>
                <p><strong>Phone:</strong> ${m.phone}</p>
                <p><strong>Service:</strong> ${m.service}</p>
                <p><strong>Date:</strong> ${m.date}</p>
                <p><strong>Message:</strong> ${m.message || "-"}</p>
                <button class="delete-booking" onclick="deleteMessage('${m._id}')">
                    Delete
                </button>
            </div>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    await apiFetch(`${API}/api/messages/${id}`, { method: "DELETE" });
    loadMessages();
}

loadMessages();

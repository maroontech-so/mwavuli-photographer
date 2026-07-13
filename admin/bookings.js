const { API, apiFetch } = window.adminAuth;

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

async function loadBookings() {
    try {
        const response = await apiFetch(`${API}/api/messages`);
        const data = await response.json();
        const container = document.getElementById("bookingContainer");
        container.innerHTML = "";

        const messages = data.messages || [];
        if (!messages.length) {
            container.innerHTML = "<p>No bookings yet.</p>";
            return;
        }

        messages.forEach(m => {
            const card = document.createElement("div");
            card.className = "booking-card";
            card.dataset.id = m._id;
            card.innerHTML = `
                <h3>${escapeHtml(m.name)}</h3>
                <p><strong>Email:</strong> ${escapeHtml(m.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(m.phone)}</p>
                <p><strong>Service:</strong> ${escapeHtml(m.service)}</p>
                <p><strong>Date:</strong> ${escapeHtml(m.date)}</p>
                <p><strong>Message:</strong> ${escapeHtml(m.message || "-")}</p>
                <button type="button" class="clear-booking" data-id="${m._id}">Clear</button>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll(".clear-booking").forEach(btn => {
            btn.addEventListener("click", () => {
                window.confirmDelete(
                    "Clear this booking?",
                    "This permanently deletes the message.",
                    async () => {
                        try {
                            await apiFetch(`${API}/api/messages/${btn.dataset.id}`, { method: "DELETE" });
                            window.showToast("Booking cleared", "success");
                            loadBookings();
                        } catch (err) {
                            window.showToast(err.message || "Could not clear booking", "error");
                        }
                    }
                );
            });
        });
    } catch (err) {
        console.error(err);
    }
}

loadBookings();

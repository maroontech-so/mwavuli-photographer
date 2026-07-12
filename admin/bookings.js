const { API, apiFetch } = window.adminAuth;

async function loadBookings() {
    try {
        const response = await apiFetch(`${API}/api/bookings`);
        const data = await response.json();
        const container = document.getElementById("bookingContainer");
        container.innerHTML = "";

        const bookings = data.bookings || [];
        if (!bookings.length) {
            container.innerHTML = "<p>No bookings yet.</p>";
            return;
        }

        bookings.forEach(booking => {
            container.innerHTML += `
            <div class="booking-card">
                <h3>${booking.name}</h3>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Service:</strong> ${booking.service}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Message:</strong> ${booking.message || "-"}</p>
                <button class="delete-booking" onclick="deleteBooking('${booking._id}')">
                    Delete
                </button>
            </div>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    await apiFetch(`${API}/api/bookings/${id}`, { method: "DELETE" });
    loadBookings();
}

loadBookings();

const { API, apiFetch } = window.adminAuth;

async function loadDashboard() {
    try {
        const [photosRes, bookingsRes, messagesRes] = await Promise.all([
            apiFetch(`${API}/api/photos`),
            apiFetch(`${API}/api/bookings`),
            apiFetch(`${API}/api/messages`)
        ]);

        const photosData = await photosRes.json();
        const bookingsData = await bookingsRes.json();
        const messagesData = await messagesRes.json();

        const photos = photosData.photos || [];
        const bookings = bookingsData.bookings || [];
        const messages = messagesData.messages || [];

        const videos = photos.filter(p => p.mediaType === "video");

        document.getElementById("photoCount").textContent = photos.length - videos.length;
        document.getElementById("videoCount").textContent = videos.length;
        document.getElementById("bookingCount").textContent = bookings.length;
        document.getElementById("messageCount").textContent = messages.length;

        // Recent uploads
        const recentMedia = document.getElementById("recentMedia");
        if (photos.length) {
            recentMedia.innerHTML = photos.slice(0, 5).map(p => `
                <div class="recent-item">
                    <strong>${p.title}</strong>
                    <span class="tag">${p.category}</span>
                </div>`).join("");
        } else {
            recentMedia.innerHTML = "<p>No uploads yet.</p>";
        }

        // Recent bookings
        const recentBookings = document.getElementById("recentBookings");
        if (bookings.length) {
            recentBookings.innerHTML = bookings.slice(0, 5).map(b => `
                <div class="recent-item">
                    <strong>${b.name}</strong>
                    <span class="tag">${b.service}</span>
                </div>`).join("");
        } else {
            recentBookings.innerHTML = "<p>No bookings yet.</p>";
        }
    } catch (error) {
        console.error(error);
    }
}

loadDashboard();

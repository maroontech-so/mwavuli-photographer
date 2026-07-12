const { API, apiFetch } = window.adminAuth;

async function loadGallery() {
    try {
        const response = await apiFetch(`${API}/api/photos`);
        const data = await response.json();
        const container = document.getElementById("galleryContainer");
        container.innerHTML = "";

        const photos = data.photos || [];
        if (!photos.length) {
            container.innerHTML = "<p>No media uploaded yet.</p>";
            return;
        }

        photos.forEach(photo => {
            container.innerHTML += `
            <div class="photo-card" data-id="${photo._id}">
                ${
                    photo.mediaType === "video"
                        ? `<video controls>
                                <source src="${API}/uploads/${photo.file}" type="video/mp4">
                           </video>`
                        : `<img src="${API}/uploads/${photo.file}" alt="${photo.title}">`
                }
                <div class="photo-info">
                    <h3>${photo.title}</h3>
                    <p>${photo.category}</p>
                    <button class="delete-btn" onclick="deletePhoto('${photo._id}')">
                        Delete
                    </button>
                </div>
            </div>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function deletePhoto(id) {
    if (!confirm("Delete this media?")) return;
    await apiFetch(`${API}/api/photos/${id}`, { method: "DELETE" });
    loadGallery();
}

loadGallery();

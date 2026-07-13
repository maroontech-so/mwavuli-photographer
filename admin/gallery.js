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
            const card = document.createElement("div");
            card.className = "photo-card";
            card.dataset.id = photo._id;
            card.innerHTML = `
                <input type="checkbox" class="card-checkbox" aria-label="Select">
                ${
                    photo.mediaType === "video"
                        ? `<video controls preload="none" poster="${API}/uploads/${photo.thumbnail || photo.file}">
                                <source src="${API}/uploads/${photo.file}" type="video/mp4">
                           </video>`
                        : `<img src="${API}/uploads/${photo.thumbnail || photo.file}" alt="${photo.title}" loading="lazy">`
                }
                <div class="photo-info">
                    <h3>${photo.title}</h3>
                    <p>${photo.category}</p>
                </div>
            `;
            container.appendChild(card);
        });

        const bulk = window.enableBulkDelete({
            containerId: "galleryContainer",
            itemClass: "photo-card",
            getId: (el) => el.dataset.id,
            deleteUrl: "/api/photos",
            loadFn
        });

        let longPressTimer = null;
        let isSelectMode = false;

        container.addEventListener("pointerdown", (e) => {
            const card = e.target.closest(".photo-card");
            if (!card) return;

            if (!isSelectMode) {
                longPressTimer = setTimeout(() => {
                    isSelectMode = true;
                    const checkbox = card.querySelector(".card-checkbox");
                    if (checkbox) checkbox.checked = true;
                    card.classList.add("selected");
                    if (bulk && bulk.updateBulkBar) bulk.updateBulkBar();
                }, 500);
            }
        });

        container.addEventListener("pointerup", () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });

        container.addEventListener("pointerleave", () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });

        container.addEventListener("pointercancel", () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });

        container.addEventListener("click", (e) => {
            if (!isSelectMode) return;
            const card = e.target.closest(".photo-card");
            if (!card) return;
            const checkbox = card.querySelector(".card-checkbox");
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change"));
            }
        });

        window.addEventListener("click", (e) => {
            if (isSelectMode && !container.contains(e.target)) {
                isSelectMode = false;
                container.querySelectorAll(".photo-card").forEach(el => {
                    el.classList.remove("selected");
                    const cb = el.querySelector(".card-checkbox");
                    if (cb) cb.checked = false;
                });
                if (bulk && bulk.updateBulkBar) bulk.updateBulkBar();
            }
        });
    } catch (err) {
        console.error(err);
    }
}

loadGallery();

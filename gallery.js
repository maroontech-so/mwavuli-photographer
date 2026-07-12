const API = window.location.port === '5000' ? '' : (window.location.protocol === 'file:' ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}:5000`);

const gallery = document.getElementById("gallery");

if (gallery) {
    const limit = parseInt(gallery.dataset.limit || "0", 10);
    let allPhotos = [];

    const searchInput = document.getElementById("searchInput");
    const sortMedia = document.getElementById("sortMedia");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const mediaButtons = document.querySelectorAll(".media-btn");

    async function loadPhotos() {
        try {
            const res = await fetch(`${API}/api/photos`);
            const data = await res.json();
            allPhotos = data.photos || [];
            render(limit ? allPhotos.slice(0, limit) : allPhotos);
        } catch (err) {
            console.error("Failed to load photos", err);
            gallery.innerHTML = "<p class='gallery-empty'>Could not load the gallery.</p>";
        }
    }

    function render(photos) {
        gallery.innerHTML = "";

        if (!photos.length) {
            gallery.innerHTML = "<p class='gallery-empty'>No media yet.</p>";
            return;
        }

        // Mosaic pattern (works through filters & sort)
        const mosaic = ["big", "", "tall", "", "wide", "", "tall", "", "", "wide"];

        photos.forEach((photo, i) => {
            const span = mosaic[i % mosaic.length];
            const media = photo.mediaType === "video"
                ? `<video controls preload="metadata" draggable="false">
                        <source src="${API}/uploads/${photo.file}" type="video/mp4">
                   </video>`
                : `<img src="${API}/uploads/${photo.file}" alt="${photo.title}" draggable="false">`;

            gallery.innerHTML += `
            <div class="gallery-item ${span}">
                ${media}
                <div class="gallery-overlay">
                    <h3>${photo.title}</h3>
                    <p>${photo.category}</p>
                </div>
            </div>`;
        });

        wireLightbox();
        protectImages();
    }

    // Lightbox (reuses #lightbox in the page)
    function wireLightbox() {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox) return;
        const lightboxImg = document.getElementById("lightbox-img");
        const closeBtn = document.querySelector(".close");

        gallery.querySelectorAll(".gallery-item img").forEach(image => {
            image.addEventListener("click", () => {
                lightbox.style.display = "flex";
                lightboxImg.src = image.src;
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", () => lightbox.style.display = "none");
        }
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) lightbox.style.display = "none";
        });
    }

    // Deterrent against casual right-click / drag download
    function protectImages() {
        gallery.querySelectorAll(".gallery-item img, .gallery-item video").forEach(el => {
            el.addEventListener("contextmenu", e => e.preventDefault());
            el.setAttribute("draggable", "false");
        });
    }

    // --- Filters / search / sort (only if present on the page) ---
    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                document.querySelector(".filter-btn.active")?.classList.remove("active");
                button.classList.add("active");
                const category = button.dataset.category;
                render(category === "All"
                    ? allPhotos
                    : allPhotos.filter(p => p.category === category));
            });
        });
    }

    if (mediaButtons.length) {
        mediaButtons.forEach(button => {
            button.addEventListener("click", () => {
                document.querySelector(".media-btn.active")?.classList.remove("active");
                button.classList.add("active");
                const type = button.dataset.type;
                render(type === "all"
                    ? allPhotos
                    : allPhotos.filter(p => p.mediaType === type));
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const keyword = searchInput.value.toLowerCase();
            render(allPhotos.filter(p =>
                p.title.toLowerCase().includes(keyword) ||
                p.category.toLowerCase().includes(keyword)
            ));
        });
    }

    if (sortMedia) {
        sortMedia.addEventListener("change", () => {
            const sorted = [...allPhotos];
            switch (sortMedia.value) {
                case "newest":
                    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case "oldest":
                    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case "az":
                    sorted.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case "za":
                    sorted.sort((a, b) => b.title.localeCompare(a.title));
                    break;
            }
            render(sorted);
        });
    }

    loadPhotos();
}

// Global guard: block right-click on any gallery image across the site
document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".gallery-item")) e.preventDefault();
});

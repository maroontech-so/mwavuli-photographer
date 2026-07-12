(function () {
    const API = window.API_BASE
        || (!window.location.port || window.location.port === '5000'
            ? ''
            : (window.location.protocol === 'file:'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`));

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    const titleEl = document.getElementById("projectTitle");
    const descEl = document.getElementById("projectDescription");
    const gallery = document.getElementById("gallery");

    if (!projectId || !gallery) {
        if (titleEl) titleEl.textContent = "Project not found";
        return;
    }

    async function loadProject() {
        try {
            const res = await fetch(`${API}/api/projects/${projectId}`);
            const data = await res.json();

            if (!data.success) {
                titleEl.textContent = "Project not found";
                return;
            }

            const project = data.project;
            const photos = data.photos || [];

            titleEl.textContent = project.title;
            descEl.textContent = project.description || "";

            gallery.innerHTML = "";

            if (!photos.length) {
                gallery.innerHTML = "<p class='gallery-empty'>No media in this project yet.</p>";
                return;
            }

    photos.forEach(photo => {
                const div = document.createElement("div");
                div.className = "gallery-item";
                const media = photo.mediaType === "video"
                    ? `<video controls preload="metadata" draggable="false"><source src="${API}/uploads/${photo.file}" type="video/mp4"></video>`
                    : `<img src="${API}/uploads/${photo.file}" alt="${photo.title}" draggable="false">`;
                div.innerHTML = media;
                gallery.appendChild(div);
            });

            const mosaic = ["big", "", "tall", "", "wide", "", "tall", "", "", "wide"];
            const items = gallery.querySelectorAll(".gallery-item");
            items.forEach((item, i) => {
                const span = mosaic[i % mosaic.length];
                if (span) item.classList.add(span);
            });

            wireLightbox();
            protectImages();
        } catch (err) {
            console.error("Failed to load project", err);
            gallery.innerHTML = "<p class='gallery-empty'>Could not load project.</p>";
        }
    }

    function wireLightbox() {
        const lightbox = document.getElementById("lightbox");
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

    function protectImages() {
        gallery.querySelectorAll(".gallery-item img, .gallery-item video").forEach(el => {
            el.addEventListener("contextmenu", e => e.preventDefault());
            el.setAttribute("draggable", "false");
        });
    }

    loadProject();
})();

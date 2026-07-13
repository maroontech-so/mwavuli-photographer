(function () {
    const API = window.API_BASE
        || (!window.location.port || window.location.port === '5000'
            ? ''
            : (window.location.protocol === 'file:'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`));

    // Cloudinary URLs are stored as-is; legacy local filenames resolve to /uploads.
    const mediaUrl = (f) => (f && /^https?:\/\//.test(f)) ? f : (API + "/uploads/" + f);

    // Rewrite a Cloudinary delivery URL to request a size-constrained,
    // auto-format/auto-quality derivative on the fly (no re-upload needed).
    function cldUrl(url, t) {
        if (!url || !/^https?:\/\/res\.cloudinary\.com\//.test(url)) return url;
        return url.replace(/\/upload\/[^/]+/, `/upload/${t}`);
    }

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

            const imageSources = [];

            photos.forEach(photo => {
                const div = document.createElement("div");
                div.className = "gallery-item";
                const thumbBase = mediaUrl(photo.thumbnail || photo.file);
                const thumbUrl = cldUrl(thumbBase, "w_640,c_limit,q_auto,f_auto");
                const fullUrl = cldUrl(mediaUrl(photo.file), "w_1600,c_limit,q_auto,f_auto");
                const media = photo.mediaType === "video"
                    ? `<video controls preload="none" poster="${thumbUrl}" draggable="false"><source src="${fullUrl}" type="video/mp4"></video>`
                    : `<img src="${thumbUrl}" alt="${photo.title}" data-full="${fullUrl}" loading="lazy" decoding="async" draggable="false">`;
                div.innerHTML = media;
                gallery.appendChild(div);

                if (photo.mediaType === "photo") {
                    imageSources.push(fullUrl);
                }
            });

            const mosaic = ["big", "", "tall", "", "wide", "", "tall", "", "", "wide"];
            const items = gallery.querySelectorAll(".gallery-item");
            items.forEach((item, i) => {
                const span = mosaic[i % mosaic.length];
                if (span) item.classList.add(span);
            });

            const images = gallery.querySelectorAll(".gallery-item img");
            images.forEach((img, idx) => {
                img.addEventListener("click", () => {
                    const srcArray = Array.from(images).map(i => i.dataset.full || i.src);
                    window.openLightbox(srcArray, idx);
                });
            });

            protectImages();
        } catch (err) {
            console.error("Failed to load project", err);
            gallery.innerHTML = "<p class='gallery-empty'>Could not load project.</p>";
        }
    }

    function protectImages() {
        gallery.querySelectorAll(".gallery-item img, .gallery-item video").forEach(el => {
            el.addEventListener("contextmenu", e => e.preventDefault());
            el.setAttribute("draggable", "false");
        });
    }

    loadProject();
})();

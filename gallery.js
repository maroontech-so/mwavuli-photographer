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

const projectCollectionsEl = document.getElementById("projectCollections");
const generalGallery = document.getElementById("generalGallery");

if (projectCollectionsEl || generalGallery) {
    async function loadGallery() {
        try {
            const [projectsRes, photosRes] = await Promise.all([
                fetch(`${API}/api/projects`),
                fetch(`${API}/api/photos`)
            ]);

            const projectsData = await projectsRes.json();
            const photosData = await photosRes.json();

            const projects = projectsData.projects || [];
            const allPhotos = photosData.photos || [];

            const generalPhotos = allPhotos.filter(p => !p.project);

            if (projectCollectionsEl) {
                renderProjectCollections(projects);
            }

            if (generalGallery) {
                renderGeneralGallery(generalPhotos);
            }
        } catch (err) {
            console.error("Failed to load gallery", err);
            if (projectCollectionsEl) {
                projectCollectionsEl.innerHTML = "<p class='gallery-empty'>Could not load collections.</p>";
            }
            if (generalGallery) {
                generalGallery.innerHTML = "<p class='gallery-empty'>Could not load gallery.</p>";
            }
        }
    }

    function renderProjectCollections(projects) {
        projectCollectionsEl.innerHTML = "";

        if (!projects.length) {
            projectCollectionsEl.innerHTML = "<p class='gallery-empty'>No projects yet.</p>";
            return;
        }

            projects.forEach(p => {
            const card = document.createElement("a");
            card.href = `project.html?id=${p._id}`;
            card.className = "gallery-collection-card";
            const cover = p.cover
                ? `<img src="${cldUrl(mediaUrl(p.cover), "w_800,c_limit,q_auto,f_auto")}" alt="${escapeHtml(p.title)}" loading="lazy" decoding="async">`
                : `<div class="project-placeholder"><i class="fa-solid fa-camera"></i></div>`;
            card.innerHTML = `
                <div class="collection-cover">
                    ${cover}
                    <div class="project-overlay">
                        <h3>${escapeHtml(p.title)}</h3>
                        <p>${escapeHtml(p.location || "")}</p>
                    </div>
                </div>
            `;
            projectCollectionsEl.appendChild(card);
        });
    }

    function renderGeneralGallery(photos) {
        generalGallery.innerHTML = "";

        if (!photos.length) {
            generalGallery.innerHTML = "<p class='gallery-empty'>No general photos yet.</p>";
            return;
        }

        const mosaic = ["big", "", "tall", "", "wide", "", "tall", "", "", "wide"];
        const imageSources = [];

        photos.forEach((photo, i) => {
            const span = mosaic[i % mosaic.length];
            const thumbBase = mediaUrl(photo.thumbnail || photo.file);
            const thumbUrl = cldUrl(thumbBase, "w_640,c_limit,q_auto,f_auto");
            const fullUrl = cldUrl(mediaUrl(photo.file), "w_1600,c_limit,q_auto,f_auto");
            const srcset =
                `${cldUrl(thumbBase, "w_400,c_limit,q_auto,f_auto")} 400w, ` +
                `${thumbUrl} 640w, ` +
                `${cldUrl(thumbBase, "w_800,c_limit,q_auto,f_auto")} 800w`;

            const media = photo.mediaType === "video"
                ? `<video controls preload="none" poster="${thumbUrl}" draggable="false">
                        <source src="${fullUrl}" type="video/mp4">
                   </video>`
                : `<img src="${thumbUrl}" srcset="${srcset}" sizes="(max-width:600px) 100vw, (max-width:1024px) 50vw, 33vw" alt="${photo.title}" data-full="${fullUrl}" loading="lazy" decoding="async" draggable="false">`;

            if (photo.mediaType === "photo") {
                imageSources.push(fullUrl);
            }

            generalGallery.innerHTML += `
            <div class="gallery-item ${span}">
                ${media}
            </div>`;
        });

        const images = generalGallery.querySelectorAll(".gallery-item img");
        images.forEach((img, idx) => {
                img.addEventListener("click", () => {
                    const srcArray = Array.from(images).map(i => i.dataset.full || i.src);
                    window.openLightbox(srcArray, idx);
                });
        });

        protectImages();
    }

    function protectImages() {
        generalGallery.querySelectorAll(".gallery-item img, .gallery-item video").forEach(el => {
            el.addEventListener("contextmenu", e => e.preventDefault());
            el.setAttribute("draggable", "false");
        });
    }

    loadGallery();
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".gallery-item")) e.preventDefault();
});

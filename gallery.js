const API = window.API_BASE
    || (!window.location.port || window.location.port === '5000'
        ? ''
        : (window.location.protocol === 'file:'
            ? 'http://localhost:5000'
            : `${window.location.protocol}//${window.location.hostname}:5000`));

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
            card.innerHTML = `
                <div class="collection-cover">
                    ${p.cover
                        ? `<img src="${API}/uploads/${p.cover}" alt="${escapeHtml(p.title)}">`
                        : `<div class="project-placeholder"><i class="fa-solid fa-camera"></i></div>`}
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
            const media = photo.mediaType === "video"
                ? `<video controls preload="metadata" draggable="false">
                        <source src="${API}/uploads/${photo.file}" type="video/mp4">
                   </video>`
                : `<img src="${API}/uploads/${photo.file}" alt="${photo.title}" draggable="false">`;

            imageSources.push(`${API}/uploads/${photo.file}`);

            generalGallery.innerHTML += `
            <div class="gallery-item ${span}">
                ${media}
            </div>`;
        });

        const images = generalGallery.querySelectorAll(".gallery-item img");
        images.forEach((img, idx) => {
            img.addEventListener("click", () => {
                const srcArray = Array.from(images).map(i => i.src);
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

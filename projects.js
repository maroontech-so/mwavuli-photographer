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

    const container = document.getElementById("projectsContainer");

    async function loadProjects() {
        try {
            const res = await fetch(`${API}/api/projects`);
            const data = await res.json();
            const projects = data.projects || [];

            container.innerHTML = "";

            if (!projects.length) {
                container.innerHTML = "<p class='gallery-empty'>No projects yet.</p>";
                return;
            }

            projects.forEach(p => {
                const card = document.createElement("a");
                card.href = `project.html?id=${p._id}`;
                card.className = "project-card";
                card.innerHTML = `
                    <div class="project-cover">
                        ${p.cover
                            ? `<img src="${cldUrl(mediaUrl(p.cover), "w_800,c_limit,q_auto,f_auto")}" alt="${p.title}" loading="lazy" decoding="async">`
                            : `<div class="project-placeholder"><i class="fa-solid fa-camera"></i></div>`}
                        <div class="project-overlay">
                            <h3>${p.title}</h3>
                            <p>${p.location || ""}</p>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } catch (err) {
            console.error("Failed to load projects", err);
            container.innerHTML = "<p class='gallery-empty'>Could not load projects.</p>";
        }
    }

    loadProjects();
})();

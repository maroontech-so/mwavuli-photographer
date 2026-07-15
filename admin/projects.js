const { API, apiFetch } = window.adminAuth;

// Cloudinary URLs are stored as-is; legacy local filenames resolve to /uploads.
const mediaUrl = (f) => (f && /^https?:\/\//.test(f)) ? f : (API + "/uploads/" + f);

const container = document.getElementById("projectContainer");
const modal = document.getElementById("projectModal");
const form = document.getElementById("projectForm");
const newBtn = document.getElementById("newProjectBtn");
const cancelBtn = document.getElementById("cancelBtn");
const modalTitle = document.getElementById("modalTitle");

const filesModal = document.getElementById("projectFilesModal");
const filesModalTitle = document.getElementById("filesModalTitle");
const projectUploadForm = document.getElementById("projectUploadForm");
const pUploadFiles = document.getElementById("pUploadFiles");
const pFileList = document.getElementById("pFileList");
const pProgressWrap = document.getElementById("pProgressWrap");
const pProgressFill = document.getElementById("pProgressFill");
const pProgressPct = document.getElementById("pProgressPct");
const pProgressStatus = document.getElementById("pProgressStatus");
const pSubmitBtn = document.getElementById("pSubmitBtn");
const pMessage = document.getElementById("pMessage");
const projectFilesGrid = document.getElementById("projectFilesGrid");
const closeFilesBtn = document.getElementById("closeFilesBtn");

let projects = [];
let currentProjectId = null;

function openModal(project = null) {
    modalTitle.textContent = project ? "Edit Project" : "New Project";
    document.getElementById("pId").value = project ? project._id : "";
    document.getElementById("pTitle").value = project ? project.title : "";
    document.getElementById("pLocation").value = project ? (project.location || "") : "";
    document.getElementById("pDescription").value = project ? (project.description || "") : "";
    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
    form.reset();
}

newBtn.addEventListener("click", () => openModal());
cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("pId").value;
    const payload = {
        title: document.getElementById("pTitle").value.trim(),
        location: document.getElementById("pLocation").value.trim(),
        description: document.getElementById("pDescription").value.trim()
    };

    try {
        if (id) {
            const res = await apiFetch(`${API}/api/projects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
        } else {
            const res = await apiFetch(`${API}/api/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
        }
        closeModal();
        loadProjects();
    } catch (err) {
        window.showToast(err.message || "Something went wrong", "error");
    }
});

async function deleteProject(id) {
    window.confirmDelete(
        "Delete this project?",
        "Photos will no longer be linked to it. This cannot be undone.",
        async () => {
            await apiFetch(`${API}/api/projects/${id}`, { method: "DELETE" });
            window.showToast("Project deleted", "success");
            loadProjects();
        }
    );
}

function renderProjects() {
    container.innerHTML = "";

    if (!projects.length) {
        container.innerHTML = "<p class='empty-state'>No projects yet.</p>";
        return;
    }

    projects.forEach(p => {
        const card = document.createElement("div");
        card.className = "project-admin-card";

        const thumb = document.createElement("div");
        thumb.className = "project-admin-thumb";
        if (p.cover) {
            const img = document.createElement("img");
            img.src = `${mediaUrl(p.cover)}`;
            img.alt = p.title;
            thumb.appendChild(img);
        } else {
            thumb.innerHTML = "<span>No cover</span>";
        }

        const info = document.createElement("div");
        info.className = "project-admin-info";
        info.innerHTML = `<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.location || "")}</p>`;

        const actions = document.createElement("div");
        actions.className = "project-admin-actions";

        const manageBtn = document.createElement("button");
        manageBtn.className = "action-manage";
        manageBtn.textContent = "Manage Files";
        manageBtn.addEventListener("click", () => openProjectFilesModal(p._id));

        const editBtn = document.createElement("button");
        editBtn.className = "action-edit";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openModal(projects.find(x => x._id === p._id)));

        const delBtn = document.createElement("button");
        delBtn.className = "action-delete";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => deleteProject(p._id));

        actions.appendChild(manageBtn);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        card.appendChild(thumb);
        card.appendChild(info);
        card.appendChild(actions);
        container.appendChild(card);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

async function loadProjects() {
    try {
        const res = await apiFetch(`${API}/api/projects`);
        const data = await res.json();
        projects = data.projects || [];
        renderProjects();
    } catch (err) {
        console.error(err);
    }
}

function openProjectFilesModal(projectId) {
    currentProjectId = projectId;
    const project = projects.find(p => p._id === projectId);
    filesModalTitle.textContent = project ? `Manage Files: ${project.title}` : "Manage Files";
    projectUploadForm.reset();
    pFileList.innerHTML = "";
    pMessage.textContent = "";
    pMessage.className = "form-msg";
    pProgressWrap.hidden = true;
    pProgressWrap.classList.remove("hiding", "processing", "complete");
    pProgressFill.style.width = "0%";
    pProgressPct.textContent = "0%";
    pProgressStatus.textContent = "";
    filesModal.classList.remove("hidden");
    loadProjectPhotos(projectId);
}

function closeFilesModal() {
    filesModal.classList.add("hidden");
    currentProjectId = null;
}

closeFilesBtn.addEventListener("click", closeFilesModal);
filesModal.addEventListener("click", (e) => {
    if (e.target === filesModal) closeFilesModal();
});

async function loadProjectPhotos(projectId) {
    try {
        const res = await apiFetch(`${API}/api/projects/${projectId}`);
        const data = await res.json();
        const photos = data.photos || [];
        renderProjectFiles(photos, data.project);
    } catch (err) {
        console.error("Failed to load project photos", err);
    }
}

function renderProjectFiles(photos, project) {
    projectFilesGrid.innerHTML = "";

    if (!photos.length) {
        projectFilesGrid.innerHTML = "<p class='empty-state'>No files in this project yet.</p>";
        return;
    }

    photos.forEach(photo => {
        const item = document.createElement("div");
        item.className = "project-file-item";
        const isCover = project && project.cover === photo.file;
        if (isCover) item.classList.add("is-cover");

        const media = photo.mediaType === "video"
            ? `<video controls preload="metadata"${photo.thumbnail ? ` poster="${mediaUrl(photo.thumbnail)}"` : ""} src="${mediaUrl(photo.file)}" type="video/mp4"></video>`
            : `<img src="${mediaUrl(photo.thumbnail || photo.file)}" alt="${photo.title}" loading="lazy">`;

        item.innerHTML = `
            <div class="project-file-media">${media}</div>
            <div class="project-file-info">
                <span class="project-file-title">${escapeHtml(photo.title)}</span>
                <span class="project-file-type">${photo.mediaType}</span>
            </div>
            <div class="project-file-actions">
                ${!isCover ? `<button class="cover-btn" data-id="${photo._id}">Set Cover</button>` : `<span class="cover-badge">Cover</span>`}
                <button class="delete-file-btn" data-id="${photo._id}">Delete</button>
            </div>
        `;

        projectFilesGrid.appendChild(item);
    });

    projectFilesGrid.querySelectorAll(".cover-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const photoId = btn.dataset.id;
            await apiFetch(`${API}/api/projects/${currentProjectId}/cover`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ coverPhotoId: photoId })
            });
            loadProjectPhotos(currentProjectId);
            loadProjects();
        });
    });

    projectFilesGrid.querySelectorAll(".delete-file-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            window.confirmDelete(
                "Remove this file?",
                "This will permanently delete the file from this project.",
                async () => {
                    const photoId = btn.dataset.id;
                    await apiFetch(`${API}/api/photos/${photoId}`, { method: "DELETE" });
                    window.showToast("File removed", "success");
                    loadProjectPhotos(currentProjectId);
                    loadProjects();
                }
            );
        });
    });
}

function renderPUploadFiles() {
    pFileList.innerHTML = "";
    [...pUploadFiles.files].forEach((file, i) => {
        const isVideo = file.type.startsWith("video");
        const item = document.createElement("div");
        item.className = "file-item";
        item.innerHTML = `
            <span class="fi-icon">${isVideo ? "🎥" : "🖼"}</span>
            <span class="fi-name">${file.name}</span>
            <span class="fi-size">${formatSize(file.size)}</span>
            <button type="button" class="fi-remove" data-i="${i}" aria-label="Remove">&times;</button>
        `;
        pFileList.appendChild(item);
    });

    pFileList.querySelectorAll(".fi-remove").forEach(btn => {
        btn.addEventListener("click", () => removePUploadFile(Number(btn.dataset.i)));
    });
}

function removePUploadFile(index) {
    const dt = new DataTransfer();
    [...pUploadFiles.files].forEach((f, i) => {
        if (i !== index) dt.items.add(f);
    });
    pUploadFiles.files = dt.files;
    renderPUploadFiles();
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function setPMessage(text, type) {
    pMessage.textContent = text;
    pMessage.className = "form-msg" + (type ? " " + type : "");
}

function showPProgress() {
    pProgressWrap.hidden = false;
    pProgressWrap.classList.remove("hiding", "processing", "complete");
    pProgressFill.style.width = "0%";
    pProgressPct.textContent = "0%";
    pProgressStatus.textContent = "Uploading…";
}

function setPUploadProgress(pct) {
    // Reserve the last 10% for server-side saving so the bar stays honest.
    pct = Math.max(0, Math.min(90, pct * 0.9));
    pProgressWrap.classList.remove("processing", "complete");
    pProgressFill.style.width = pct + "%";
    pProgressPct.textContent = Math.round(pct) + "%";
    pProgressStatus.textContent = "Uploading…";
}

function startPProcessing() {
    pProgressWrap.classList.add("processing");
    pProgressWrap.classList.remove("complete");
    pProgressFill.style.width = "100%";
    pProgressPct.textContent = "100%";
    pProgressStatus.textContent = "Saving…";
}

function finishPProgress() {
    pProgressWrap.classList.remove("processing");
    pProgressWrap.classList.add("complete");
    pProgressFill.style.width = "100%";
    pProgressPct.textContent = "✓";
    pProgressStatus.textContent = "Done";
}

function hidePProgress() {
    pProgressWrap.classList.add("hiding");
    setTimeout(() => {
        pProgressWrap.hidden = true;
        pProgressWrap.classList.remove("hiding", "processing", "complete");
        pProgressFill.style.width = "0%";
        pProgressPct.textContent = "0%";
        pProgressStatus.textContent = "";
    }, 450);
}

pUploadFiles.addEventListener("change", renderPUploadFiles);

projectUploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("pUploadTitle")?.value || "";
    const location = document.getElementById("pUploadLocation")?.value || "";

    if (!pUploadFiles.files.length) {
        setPMessage("Please select at least one file.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", "General");
    formData.append("project", currentProjectId);
    [...pUploadFiles.files].forEach(f => formData.append("images", f));

    const token = window.adminAuth.getToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/photos/upload`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) setPUploadProgress((ev.loaded / ev.total) * 100);
    });

    // Network transfer finished; server is still saving the file(s).
    xhr.upload.addEventListener("load", () => startPProcessing());

    xhr.addEventListener("load", () => {
        pSubmitBtn.disabled = false;
        pSubmitBtn.textContent = "Upload to Project";

        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch (_) {}

        if (xhr.status === 401) {
            window.adminAuth.logout();
            return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            finishPProgress();
            window.showToast(`${data.message}`, "success");
            projectUploadForm.reset();
            pFileList.innerHTML = "";
            loadProjectPhotos(currentProjectId);
            loadProjects();
            setTimeout(hidePProgress, 900);
        } else {
            hidePProgress();
            setPMessage(data.message || "Upload failed. Please try again.", "error");
        }
    });

    xhr.addEventListener("error", () => {
        pSubmitBtn.disabled = false;
        pSubmitBtn.textContent = "Upload to Project";
        hidePProgress();
        setPMessage("Network error. Is the server running?", "error");
    });

    pSubmitBtn.disabled = true;
    pSubmitBtn.textContent = "Uploading...";
    showPProgress();
    xhr.send(formData);
});

loadProjects();

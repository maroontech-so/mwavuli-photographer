const { API, apiFetch } = window.adminAuth;

const container = document.getElementById("projectContainer");
const modal = document.getElementById("projectModal");
const form = document.getElementById("projectForm");
const newBtn = document.getElementById("newProjectBtn");
const cancelBtn = document.getElementById("cancelBtn");
const modalTitle = document.getElementById("modalTitle");

let projects = [];

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
        alert(err.message || "Something went wrong");
    }
});

async function deleteProject(id) {
    if (!confirm("Delete this project? Photos will no longer be linked to it.")) return;
    await apiFetch(`${API}/api/projects/${id}`, { method: "DELETE" });
    loadProjects();
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
            img.src = `${API}/uploads/${p.cover}`;
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

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openModal(projects.find(x => x._id === p._id)));

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => deleteProject(p._id));

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

loadProjects();
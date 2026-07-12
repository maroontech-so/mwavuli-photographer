const { API, getToken } = window.adminAuth;

const form = document.getElementById("uploadForm");
const message = document.getElementById("message");
const fileInput = document.getElementById("images");
const fileList = document.getElementById("fileList");
const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressPct = document.getElementById("progressPct");
const submitBtn = document.getElementById("submitBtn");

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function renderFiles() {
    fileList.innerHTML = "";
    [...fileInput.files].forEach((file, i) => {
        const isVideo = file.type.startsWith("video");
        const item = document.createElement("div");
        item.className = "file-item";
        item.innerHTML = `
            <span class="fi-icon">${isVideo ? "🎥" : "🖼"}</span>
            <span class="fi-name">${file.name}</span>
            <span class="fi-size">${formatSize(file.size)}</span>
            <button type="button" class="fi-remove" data-i="${i}" aria-label="Remove">&times;</button>
        `;
        fileList.appendChild(item);
    });

    fileList.querySelectorAll(".fi-remove").forEach(btn => {
        btn.addEventListener("click", () => removeFile(Number(btn.dataset.i)));
    });
}

function removeFile(index) {
    const dt = new DataTransfer();
    [...fileInput.files].forEach((f, i) => {
        if (i !== index) dt.items.add(f);
    });
    fileInput.files = dt.files;
    renderFiles();
}

fileInput.addEventListener("change", renderFiles);

function setMessage(text, type) {
    message.textContent = text;
    message.className = "form-msg" + (type ? " " + type : "");
}

function setProgress(pct) {
    progressWrap.hidden = false;
    progressFill.style.width = pct + "%";
    progressPct.textContent = Math.round(pct) + "%";
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("category").value;
    if (!category) {
        setMessage("Please choose a category.", "error");
        return;
    }
    if (!fileInput.files.length) {
        setMessage("Please select at least one file.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("category", category);
    [...fileInput.files].forEach(f => formData.append("images", f));

    const token = getToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/photos/upload`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) setProgress((ev.loaded / ev.total) * 100);
    });

    xhr.addEventListener("load", () => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Media";

        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch (_) {}

        if (xhr.status === 401) {
            window.adminAuth.logout();
            return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            setMessage(
                `${data.message}. They now appear on the homepage gallery.`,
                "success"
            );
            form.reset();
            fileList.innerHTML = "";
            progressWrap.hidden = true;
            progressFill.style.width = "0%";
        } else {
            setMessage(data.message || "Upload failed. Please try again.", "error");
        }
    });

    xhr.addEventListener("error", () => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Media";
        setMessage("Network error. Is the server running?", "error");
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";
    setProgress(0);
    xhr.send(formData);
});

renderFiles();

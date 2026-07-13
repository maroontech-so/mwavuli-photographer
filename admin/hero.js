const { API, apiFetch } = window.adminAuth;

// Cloudinary URLs are stored as-is; legacy local filenames resolve to /uploads.
const mediaUrl = (f) => (f && /^https?:\/\//.test(f)) ? f : (API + "/uploads/" + f);

const slidesGrid = document.getElementById("heroSlidesGrid");
const emptyMsg = document.getElementById("heroEmpty");
const heroMsg = document.getElementById("heroMsg");
const settingsMsg = document.getElementById("settingsMsg");

const heroEnabled = document.getElementById("heroEnabled");
const heroAutoplay = document.getElementById("heroAutoplay");
const heroInterval = document.getElementById("heroInterval");

const form = document.getElementById("heroUploadForm");
const fileInput = document.getElementById("heroFile");
const submitBtn = document.getElementById("heroSubmitBtn");
const progressWrap = document.getElementById("heroProgressWrap");
const progressFill = document.getElementById("heroProgressFill");
const progressPct = document.getElementById("heroProgressPct");

function setMsg(el, text, type) {
    el.textContent = text;
    el.className = "form-msg" + (type ? " " + type : "");
}

function renderSlides(slides) {
    slidesGrid.innerHTML = "";
    if (!slides.length) {
        emptyMsg.hidden = false;
        return;
    }
    emptyMsg.hidden = true;

    slides.forEach((slide, i) => {
        const item = document.createElement("div");
        item.className = "hero-slide-item";
        item.innerHTML = `
            <img src="${mediaUrl(slide.thumbnail || slide.image)}" alt="Hero slide" loading="lazy">
            <div class="hero-slide-actions">
                <button type="button" class="up-btn" data-id="${slide._id}" ${i === 0 ? "disabled" : ""}>↑</button>
                <button type="button" class="down-btn" data-id="${slide._id}" ${i === slides.length - 1 ? "disabled" : ""}>↓</button>
                <button type="button" class="del-btn" data-id="${slide._id}">Delete</button>
            </div>
        `;
        slidesGrid.appendChild(item);
    });

    slidesGrid.querySelectorAll(".up-btn").forEach(btn => {
        btn.addEventListener("click", () => move(btn.dataset.id, -1));
    });
    slidesGrid.querySelectorAll(".down-btn").forEach(btn => {
        btn.addEventListener("click", () => move(btn.dataset.id, 1));
    });
    slidesGrid.querySelectorAll(".del-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            window.confirmDelete("Delete this slide?", "This removes the image from the hero slideshow.", async () => {
                try {
                    await apiFetch(`${API}/api/hero/slide/${btn.dataset.id}`, { method: "DELETE" });
                    window.showToast("Slide deleted", "success");
                    loadHero();
                } catch (err) {
                    window.showToast(err.message || "Delete failed", "error");
                }
            });
        });
    });
}

async function move(id, dir) {
    try {
        const data = await loadHeroData();
        const ids = data.slides.map(s => s._id);
        const idx = ids.indexOf(id);
        if (idx === -1) return;
        const swap = idx + dir;
        if (swap < 0 || swap >= ids.length) return;
        [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
        await apiFetch(`${API}/api/hero/order`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderedIds: ids })
        });
        loadHero();
    } catch (err) {
        window.showToast(err.message || "Reorder failed", "error");
    }
}

async function loadHeroData() {
    const res = await apiFetch(`${API}/api/hero`);
    return res.json();
}

async function loadHero() {
    try {
        const data = await loadHeroData();
        heroEnabled.checked = data.enabled;
        heroAutoplay.checked = data.autoplay;
        heroInterval.value = data.interval;
        renderSlides(data.slides);
    } catch (err) {
        console.error("Failed to load hero", err);
    }
}

// Upload a new slide
form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!fileInput.files.length) {
        setMsg(heroMsg, "Please choose an image.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    const token = window.adminAuth.getToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/hero/slide`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            progressWrap.hidden = false;
            progressFill.style.width = pct + "%";
            progressPct.textContent = pct + "%";
        }
    });

    xhr.addEventListener("load", () => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Image";
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch (_) {}

        if (xhr.status === 401) {
            window.adminAuth.logout();
            return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            window.showToast("Slide added", "success");
            form.reset();
            progressWrap.hidden = true;
            progressFill.style.width = "0%";
            loadHero();
        } else {
            setMsg(heroMsg, data.message || "Upload failed.", "error");
        }
    });

    xhr.addEventListener("error", () => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Image";
        setMsg(heroMsg, "Network error. Is the server running?", "error");
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";
    setProgress(0);
    xhr.send(formData);
});

document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    try {
        await apiFetch(`${API}/api/hero`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                enabled: heroEnabled.checked,
                autoplay: heroAutoplay.checked,
                interval: parseInt(heroInterval.value, 10) || 5000
            })
        });
        setMsg(settingsMsg, "Settings saved", "success");
        window.showToast("Hero settings saved", "success");
    } catch (err) {
        setMsg(settingsMsg, err.message || "Save failed", "error");
    }
});

function setProgress(pct) {
    progressWrap.hidden = false;
    progressFill.style.width = pct + "%";
    progressPct.textContent = Math.round(pct) + "%";
}

loadHero();

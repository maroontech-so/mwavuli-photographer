const { API, apiFetch } = window.adminAuth;

const form = document.getElementById("testimonialForm");
const message = document.getElementById("tMessage");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById("tName").value,
        text: document.getElementById("tText").value,
        rating: Number(document.getElementById("tRating").value)
    };

    try {
        const res = await apiFetch(`${API}/api/testimonials`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        message.style.color = data.success ? "green" : "red";
        message.textContent = data.success ? "Testimonial added!" : (data.message || "Failed");
        if (data.success) {
            form.reset();
            loadTestimonials();
        }
    } catch (err) {
        message.style.color = "red";
        message.textContent = "Network error.";
    }
});

async function loadTestimonials() {
    try {
        const res = await apiFetch(`${API}/api/testimonials`);
        const data = await res.json();
        const container = document.getElementById("testimonialContainer");
        container.innerHTML = "";

        const items = data.testimonials || [];
        if (!items.length) {
            container.innerHTML = "<p>No testimonials yet.</p>";
            return;
        }

        items.forEach(t => {
            const card = document.createElement("div");
            card.className = "testimonial-admin-card";
            card.dataset.id = t._id;
            card.innerHTML = `
                <input type="checkbox" class="card-checkbox" aria-label="Select">
                <div class="stars">${"★".repeat(t.rating || 5)}</div>
                <p>"${t.text}"</p>
                <h4>${t.name}</h4>
            `;
            container.appendChild(card);
        });

        const bulk = window.enableBulkDelete({
            containerId: "testimonialContainer",
            itemClass: "testimonial-admin-card",
            getId: (el) => el.dataset.id,
            deleteUrl: "/api/testimonials",
            loadFn
        });

        let longPressTimer = null;
        let isSelectMode = false;

        container.addEventListener("pointerdown", (e) => {
            const card = e.target.closest(".testimonial-admin-card");
            if (!card) return;

            if (!isSelectMode) {
                longPressTimer = setTimeout(() => {
                    isSelectMode = true;
                    const checkbox = card.querySelector(".card-checkbox");
                    if (checkbox) checkbox.checked = true;
                    card.classList.add("selected");
                    if (bulk && bulk.updateBulkBar) bulk.updateBulkBar();
                }, 500);
            }
        });

        container.addEventListener("pointerup", () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });

        container.addEventListener("pointerleave", () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });

        container.addEventListener("pointercancel", () => {
            if (longPressTimer) clearTimeout(longPressTimer);
        });

        container.addEventListener("click", (e) => {
            if (!isSelectMode) return;
            const card = e.target.closest(".testimonial-admin-card");
            if (!card) return;
            const checkbox = card.querySelector(".card-checkbox");
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change"));
            }
        });

        window.addEventListener("click", (e) => {
            if (isSelectMode && !container.contains(e.target)) {
                isSelectMode = false;
                container.querySelectorAll(".testimonial-admin-card").forEach(el => {
                    el.classList.remove("selected");
                    const cb = el.querySelector(".card-checkbox");
                    if (cb) cb.checked = false;
                });
                if (bulk && bulk.updateBulkBar) bulk.updateBulkBar();
            }
        });
    } catch (err) {
        console.error(err);
    }
}

loadTestimonials();

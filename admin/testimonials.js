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
                <div class="stars">${"★".repeat(t.rating || 5)}</div>
                <p>"${escapeHtml(t.text)}"</p>
                <h4>${escapeHtml(t.name)}</h4>
                <button type="button" class="delete-btn" data-id="${t._id}">Delete</button>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                window.confirmDelete(
                    "Delete this testimonial?",
                    "This permanently removes it from the site.",
                    async () => {
                        try {
                            await apiFetch(`${API}/api/testimonials/${btn.dataset.id}`, { method: "DELETE" });
                            window.showToast("Testimonial deleted", "success");
                            loadTestimonials();
                        } catch (err) {
                            window.showToast(err.message || "Could not delete", "error");
                        }
                    }
                );
            });
        });
    } catch (err) {
        console.error(err);
    }
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

loadTestimonials();

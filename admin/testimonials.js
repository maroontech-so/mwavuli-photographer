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
            container.innerHTML += `
            <div class="testimonial-admin-card">
                <div class="stars">${"★".repeat(t.rating || 5)}</div>
                <p>"${t.text}"</p>
                <h4>${t.name}</h4>
                <button class="delete-btn" onclick="deleteTestimonial('${t._id}')">
                    Delete
                </button>
            </div>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function deleteTestimonial(id) {
    if (!confirm("Delete this testimonial?")) return;
    await apiFetch(`${API}/api/testimonials/${id}`, { method: "DELETE" });
    loadTestimonials();
}

loadTestimonials();

const { API, apiFetch } = window.adminAuth;

async function loadMessages() {
    try {
        const response = await apiFetch(`${API}/api/messages`);
        const data = await response.json();
        const container = document.getElementById("messageContainer");
        container.innerHTML = "";

        const messages = data.messages || [];
        if (!messages.length) {
            container.innerHTML = "<p>No messages yet.</p>";
            return;
        }

        messages.forEach(m => {
            const card = document.createElement("div");
            card.className = "message-card";
            card.dataset.id = m._id;
            card.innerHTML = `
                <input type="checkbox" class="card-checkbox" aria-label="Select">
                <h3>${m.name}</h3>
                <p><strong>Email:</strong> ${m.email}</p>
                <p><strong>Phone:</strong> ${m.phone}</p>
                <p><strong>Service:</strong> ${m.service}</p>
                <p><strong>Date:</strong> ${m.date}</p>
                <p><strong>Message:</strong> ${m.message || "-"}</p>
            `;
            container.appendChild(card);
        });

        const bulk = window.enableBulkDelete({
            containerId: "messageContainer",
            itemClass: "message-card",
            getId: (el) => el.dataset.id,
            deleteUrl: "/api/messages",
            loadFn
        });

        let longPressTimer = null;
        let isSelectMode = false;

        container.addEventListener("pointerdown", (e) => {
            const card = e.target.closest(".message-card");
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
            const card = e.target.closest(".message-card");
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
                container.querySelectorAll(".message-card").forEach(el => {
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

loadMessages();

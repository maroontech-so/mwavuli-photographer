(function () {
    const API = window.API_BASE
        || (!window.location.port || window.location.port === '5000'
            ? ''
            : (window.location.protocol === 'file:'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`));

    // Contact form -> creates a booking/message
    const contactForm = document.getElementById("contactForm");
    const bookingMessage = document.getElementById("bookingMessage");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                service: document.getElementById("service").value,
                date: document.getElementById("date").value,
                message: document.getElementById("message").value
            };

            try {
                const res = await fetch(`${API}/api/messages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                bookingMessage.style.color = data.success ? "green" : "red";
                bookingMessage.textContent = data.success
                    ? "Thank you! Your request was sent. We'll be in touch soon."
                    : (data.message || "Something went wrong.");
                if (data.success) contactForm.reset();
            } catch (err) {
                bookingMessage.style.color = "red";
                bookingMessage.textContent = "Network error. Please try again.";
            }
        });
    }

    // Testimonials
    async function loadTestimonials() {
        const container = document.getElementById("testimonialContainer");
        if (!container) return;
        try {
            const res = await fetch(`${API}/api/testimonials`);
            const data = await res.json();
            const items = data.testimonials || [];
            if (!items.length) return;

            container.innerHTML = items.map(t => `
                <div class="testimonial-card">
                    <div class="stars">${"★".repeat(t.rating || 5)}</div>
                    <p>"${t.text}"</p>
                    <h4>${t.name}</h4>
                </div>`).join("");
        } catch (err) {
            console.error("Failed to load testimonials", err);
        }
    }

    // Mobile nav toggle
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => navMenu.classList.toggle("open"));
        navMenu.querySelectorAll("a").forEach(link =>
            link.addEventListener("click", () => navMenu.classList.remove("open"))
        );
    }

    loadTestimonials();

    // Custom date picker calendar for booking form
    if (document.getElementById('date') && document.getElementById('miniCalendar')) {
        const dateInput = document.getElementById('date');
        const miniCalendar = document.getElementById('miniCalendar');
        const monthYearTitle = document.getElementById('monthYearTitle');
        const calendarDaysGrid = document.getElementById('calendarDaysGrid');
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let displayDate = new Date();
        let selectedDate = null;
        const realToday = new Date();

        function renderCalendar() {
            const year = displayDate.getFullYear();
            const month = displayDate.getMonth();
            monthYearTitle.textContent = `${monthNames[month]} ${year}`;
            const firstDayIndex = new Date(year, month, 1).getDay();
            const totalDays = new Date(year, month + 1, 0).getDate();
            calendarDaysGrid.innerHTML = '';

            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('day', 'empty');
                calendarDaysGrid.appendChild(emptyCell);
            }

            for (let day = 1; day <= totalDays; day++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('day');
                dayCell.textContent = day;
                const isToday = day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear();
                const isSelected = selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                if (isToday) dayCell.classList.add('today');
                if (isSelected) dayCell.classList.add('selected');
                dayCell.addEventListener('click', () => {
                    selectedDate = new Date(year, month, day);
                    const formattedMonth = String(month + 1).padStart(2, '0');
                    const formattedDay = String(day).padStart(2, '0');
                    dateInput.value = `${year}-${formattedMonth}-${formattedDay}`;
                    renderCalendar();
                    miniCalendar.classList.remove('active');
                });
                calendarDaysGrid.appendChild(dayCell);
            }
        }

        dateInput.addEventListener('click', (e) => {
            e.stopPropagation();
            miniCalendar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.datepicker-container')) {
                miniCalendar.classList.remove('active');
            }
        });

        prevMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            displayDate.setMonth(displayDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            displayDate.setMonth(displayDate.getMonth() + 1);
            renderCalendar();
        });

        renderCalendar();
    }
})();

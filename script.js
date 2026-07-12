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
                if (data.success) {
                    window.showToast("Thank you! Your booking request was sent. We'll be in touch soon.", "success");
                    contactForm.reset();
                } else {
                    bookingMessage.style.color = "red";
                    bookingMessage.textContent = data.message || "Something went wrong.";
                }
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

    loadTestimonials();

    // Mobile sidebar nav
    const navToggle = document.getElementById("navToggle");
    const sidebar = document.querySelector(".mobile-sidebar");
    const sidebarClose = document.querySelector(".sidebar-close");
    const sidebarLinks = sidebar ? sidebar.querySelectorAll("a") : [];

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove("open");
        document.body.style.overflow = "";
    }

    if (navToggle) {
        navToggle.addEventListener("click", openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener("click", closeSidebar);
    }

    if (sidebar) {
        sidebar.addEventListener("click", (e) => {
            if (e.target === sidebar.querySelector(".sidebar-backdrop")) {
                closeSidebar();
            }
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener("click", closeSidebar);
    });

    // Featured projects carousel - smooth infinite scroll
    const carouselTrack = document.getElementById("featuredCarousel");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");

    if (carouselTrack) {
        let projects = [];
        let slidesPerView = 3;

        function updateSlidesPerView() {
            if (window.innerWidth <= 768) {
                slidesPerView = 1;
            } else if (window.innerWidth <= 1024) {
                slidesPerView = 2;
            } else {
                slidesPerView = 3;
            }
        }

        function createCard(project) {
            return `
                <a class="featured-card" href="project.html?id=${project._id}">
                    <div class="project-cover">
                        ${project.cover
                            ? `<img src="${API}/uploads/${project.cover}" alt="${escapeHtml(project.title)}">`
                            : `<div class="project-placeholder"><i class="fa-solid fa-camera"></i></div>`}
                        <div class="project-overlay">
                            <h3>${escapeHtml(project.title)}</h3>
                            <p>${escapeHtml(project.location || "")}</p>
                        </div>
                    </div>
                </a>
            `;
        }

        async function loadProjects() {
            try {
                const res = await fetch(`${API}/api/projects`);
                const data = await res.json();
                projects = data.projects || [];
                renderCarousel();
            } catch (err) {
                console.error("Failed to load projects", err);
                carouselTrack.innerHTML = "<p class='gallery-empty'>Could not load projects.</p>";
            }
        }

        function renderCarousel() {
            if (!projects.length) {
                carouselTrack.innerHTML = "<p class='gallery-empty'>No projects yet.</p>";
                return;
            }

            updateSlidesPerView();

            const cards = projects.map(createCard).join("");
            carouselTrack.innerHTML = cards + cards;
            carouselTrack.classList.add("animate");
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                carouselTrack.classList.remove("animate");
                carouselTrack.style.transition = "transform 0.5s ease";
                carouselTrack.style.transform = `translateX(${carouselTrack.offsetWidth / 2}px)`;
                setTimeout(() => {
                    carouselTrack.style.transition = "none";
                    carouselTrack.style.transform = "translateX(0)";
                    carouselTrack.classList.add("animate");
                }, 500);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                carouselTrack.classList.remove("animate");
                carouselTrack.style.transition = "transform 0.5s ease";
                carouselTrack.style.transform = `translateX(-${carouselTrack.offsetWidth / 2}px)`;
                setTimeout(() => {
                    carouselTrack.style.transition = "none";
                    carouselTrack.style.transform = "translateX(0)";
                    carouselTrack.classList.add("animate");
                }, 500);
            });
        }

        window.addEventListener("resize", () => {
            updateSlidesPerView();
        });

        loadProjects();
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

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

    // Enhanced service picker
    const servicePicker = document.getElementById('servicePicker');
    if (servicePicker) {
        const trigger = document.getElementById('servicePickerTrigger');
        const dropdown = document.getElementById('servicePickerDropdown');
        const valueEl = document.getElementById('servicePickerValue');
        const hiddenSelect = document.getElementById('service');
        const options = Array.from(dropdown.querySelectorAll('.service-picker-option'));

        function openPicker() {
            servicePicker.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
        }

        function closePicker() {
            servicePicker.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            options.forEach(opt => opt.classList.remove('focused'));
        }

        function selectOption(option) {
            const value = option.dataset.value;
            const text = option.querySelector('.service-text').textContent;
            options.forEach(opt => {
                opt.classList.remove('selected');
                opt.setAttribute('aria-selected', 'false');
            });
            option.classList.add('selected');
            option.setAttribute('aria-selected', 'true');
            valueEl.textContent = text;
            valueEl.classList.remove('placeholder');
            hiddenSelect.value = value;
            closePicker();
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (servicePicker.classList.contains('open')) {
                closePicker();
            } else {
                openPicker();
            }
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (servicePicker.classList.contains('open')) {
                    closePicker();
                } else {
                    openPicker();
                }
            }
        });

        options.forEach((option, index) => {
            option.addEventListener('click', () => selectOption(option));
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectOption(option);
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = options[(index + 1) % options.length];
                    next.focus();
                    options.forEach(o => o.classList.remove('focused'));
                    next.classList.add('focused');
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = options[(index - 1 + options.length) % options.length];
                    prev.focus();
                    options.forEach(o => o.classList.remove('focused'));
                    prev.classList.add('focused');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!servicePicker.contains(e.target)) {
                closePicker();
            }
        });
    }
})();

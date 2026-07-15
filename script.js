(function () {
    const API = (function () {
        if (window.API_BASE) return window.API_BASE;
        const { protocol, hostname, port, origin } = window.location;
        if (protocol === 'file:') return 'http://localhost:5000';
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '[::1]') {
            return (port === '5000' || port === '') ? '' : 'http://localhost:5000';
        }
        return origin; // deployed: same-origin serverless API
    })();
    // Cloudinary URLs are stored as-is; legacy local filenames resolve to /uploads.
    const mediaUrl = (f) => (f && /^https?:\/\//.test(f)) ? f : (API + "/uploads/" + f);

    // Rewrite a Cloudinary delivery URL to request a size-constrained,
    // auto-format/auto-quality derivative on the fly (no re-upload needed).
    function cldUrl(url, t) {
        if (!url || !/^https?:\/\/res\.cloudinary\.com\//.test(url)) return url;
        return url.replace(/\/upload\/[^/]+/, `/upload/${t}`);
    }
    console.debug('[booking] API base =', JSON.stringify(API));

    // Self-contained toast (public site has no admin bundle).
    window.showToast = function (message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
        toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-body">${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };

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
                console.error('Booking request failed:', err);
                bookingMessage.style.color = "red";
                bookingMessage.textContent = "Network error. Please try again." +
                    (err && err.message ? ` (${err.message})` : "");
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

    // Featured projects carousel - slideshow
    const carouselTrack = document.getElementById("featuredCarousel");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");

    if (carouselTrack) {
        let projects = [];
        let currentIndex = 0;
        let slidesPerView = 3;
        let autoplayInterval = null;

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
                <a class="featured-card" href="gallery.html">
                    <div class="project-cover">
                        ${project.cover
                            ? `<img src="${mediaUrl(project.cover)}" alt="${escapeHtml(project.title)}">`
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
                startAutoplay();
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
            carouselTrack.innerHTML = projects.map(createCard).join("");
            currentIndex = 0;
            updateCarouselPosition(false);
        }

        function updateCarouselPosition(animate = true) {
            const cards = carouselTrack.querySelectorAll(".featured-card");
            if (!cards.length) return;

            const card = cards[0];
            const cardWidth = card.offsetWidth;
            const gap = 24;
            const maxIndex = Math.max(0, projects.length - slidesPerView);
            currentIndex = Math.min(currentIndex, maxIndex);
            currentIndex = Math.max(currentIndex, 0);

            const offset = currentIndex * (cardWidth + gap);
            carouselTrack.style.transition = animate ? "transform 0.6s ease" : "none";
            carouselTrack.style.transform = `translateX(-${offset}px)`;
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayInterval = setInterval(() => {
                const cards = carouselTrack.querySelectorAll(".featured-card");
                if (!cards.length) return;
                const maxIndex = Math.max(0, projects.length - slidesPerView);
                currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
                updateCarouselPosition(true);
            }, 4000);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                currentIndex--;
                updateCarouselPosition(true);
                stopAutoplay();
                startAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                currentIndex++;
                updateCarouselPosition(true);
                stopAutoplay();
                startAutoplay();
            });
        }

        carouselTrack.addEventListener("mouseenter", stopAutoplay);
        carouselTrack.addEventListener("mouseleave", startAutoplay);
        carouselTrack.addEventListener("touchstart", stopAutoplay, { passive: true });
        carouselTrack.addEventListener("touchend", () => {
            setTimeout(startAutoplay, 3000);
        });

        window.addEventListener("resize", () => {
            updateSlidesPerView();
            updateCarouselPosition(false);
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

    // ---- About image (dynamic) ----
    async function loadAboutImage() {
        const container = document.getElementById("aboutImageContainer");
        if (!container) return;
        try {
            const res = await fetch(`${API}/api/about`);
            const data = await res.json();
            if (data && data.success && data.image) {
                container.innerHTML = `<picture><source srcset="${cldUrl(mediaUrl(data.image), 'w_800,c_limit,q_auto,f_auto')}" type="image/webp"><img src="${cldUrl(mediaUrl(data.image), 'w_800,c_limit,q_auto,f_auto')}" alt="${data.alt || 'Photographer'}" loading="lazy" decoding="async" width="450" height="506" fetchpriority="high"></picture>`;
            }
        } catch (err) {
            console.error("Failed to load about image", err);
        }
    }

    // ---- Hero slideshow (dynamic, swipe-able) ----
    function initHeroSlideshow() {
        const container = document.getElementById("heroSlides");
        if (!container) return;

        let slides = [];
        let index = 0;
        let timer = null;
        let dragging = false;
        let startX = 0;
        let deltaX = 0;
        let autoplay = true;
        let interval = 5000;
        let track = null;

        function setTransform(px) {
            if (!track) return;
            track.style.transform = `translateX(${px}px)`;
        }

        function heroBg(s) {
            return cldUrl(mediaUrl(s.image), "w_1280,c_limit,q_auto,f_auto");
        }

        // Ensure a slide has its (size-constrained) background applied before
        // it is shown, so we never download a slide we don't need.
        function ensureBg(i) {
            const el = track && track.children[i];
            if (el && el.dataset.bg) {
                el.style.backgroundImage = `url('${el.dataset.bg}')`;
                delete el.dataset.bg;
            }
        }

        function go(i) {
            if (!slides.length) return;
            index = (i + slides.length) % slides.length;
            ensureBg(index);
            if (track) {
                track.style.transition = "transform 0.8s cubic-bezier(.22,.61,.36,1)";
                setTransform(-index * container.clientWidth);
            }
        }

        function startAuto() {
            stopAuto();
            if (autoplay && slides.length > 1) {
                timer = setInterval(() => go(index + 1), interval);
            }
        }

        function stopAuto() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        function buildTrack() {
            // Preload only the first (above-the-fold) slide for an instant LCP.
            const preload = document.createElement("link");
            preload.rel = "preload";
            preload.as = "image";
            preload.href = heroBg(slides[0]);
            document.head.appendChild(preload);

            container.innerHTML = `<div class="hero-track" id="heroTrack">` +
                slides.map((s, i) =>
                    i === 0
                        ? `<div class="hero-slide" style="background-image:url('${heroBg(s)}')"></div>`
                        : `<div class="hero-slide" data-bg="${heroBg(s)}"></div>`
                ).join("") +
                `</div>`;
            track = document.getElementById("heroTrack");

            // Fill in the remaining slides only when the browser is idle, so a
            // slow device isn't swamped downloading every hero image at once.
            const fillRest = () => slides.forEach((s, i) => ensureBg(i));
            if ("requestIdleCallback" in window) {
                requestIdleCallback(fillRest, { timeout: 2500 });
            } else {
                window.addEventListener("load", fillRest, { once: true });
            }

            track.addEventListener("touchstart", (e) => {
                dragging = true;
                startX = e.touches[0].clientX;
                deltaX = 0;
                stopAuto();
                track.style.transition = "none";
            }, { passive: true });

            track.addEventListener("touchmove", (e) => {
                if (!dragging) return;
                deltaX = e.touches[0].clientX - startX;
                setTransform(-index * container.clientWidth + deltaX);
            }, { passive: true });

            track.addEventListener("touchend", () => {
                if (!dragging) return;
                dragging = false;
                if (Math.abs(deltaX) > 50) go(index + (deltaX < 0 ? 1 : -1));
                else go(index);
                startAuto();
            });

            track.addEventListener("mousedown", (e) => {
                dragging = true;
                startX = e.clientX;
                deltaX = 0;
                stopAuto();
                track.style.transition = "none";
            });

            window.addEventListener("mousemove", (e) => {
                if (!dragging) return;
                deltaX = e.clientX - startX;
                setTransform(-index * container.clientWidth + deltaX);
            });

            window.addEventListener("mouseup", () => {
                if (!dragging) return;
                dragging = false;
                if (Math.abs(deltaX) > 50) go(index + (deltaX < 0 ? 1 : -1));
                else go(index);
                startAuto();
            });

            window.addEventListener("resize", () => go(index));

            go(0);
            startAuto();
        }

        function showFallback() {
            container.innerHTML = `<div class="hero-slide hero-slide-fallback"></div>`;
        }

        fetch(`${API}/api/hero`)
            .then(r => r.json())
            .then(data => {
                if (!data || !data.success || !data.enabled || !data.slides || !data.slides.length) {
                    showFallback();
                    return;
                }
                slides = data.slides;
                autoplay = data.autoplay;
                interval = data.interval || 5000;
                buildTrack();
            })
            .catch(() => showFallback());
    }

    loadAboutImage();
    initHeroSlideshow();
})();

(function () {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const prevBtn = document.querySelector(".lightbox-prev");
    const nextBtn = document.querySelector(".lightbox-next");
    const closeBtn = document.querySelector(".close");

    if (!lightbox || !lightboxImg) return;

    let images = [];
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function showImage(index) {
        if (!images.length) return;
        currentIndex = (index + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    function nextImage() {
        showImage(currentIndex + 1);
    }

    function prevImage() {
        showImage(currentIndex - 1);
    }

    function openLightbox(srcArray, startIndex = 0) {
        images = srcArray || [];
        if (!images.length) return;
        currentIndex = Math.min(startIndex, images.length - 1);
        lightboxImg.src = images[currentIndex];
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        document.body.style.overflow = "";
        images = [];
    }

    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevImage(); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextImage(); });
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    lightbox.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display !== "flex") return;
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "Escape") closeLightbox();
    });

    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
})();

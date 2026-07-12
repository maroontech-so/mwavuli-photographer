const { logout } = window.adminAuth;

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
    });
}

const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarMenu = document.getElementById("sidebarMenu");
if (sidebarToggle && sidebarMenu) {
    sidebarToggle.addEventListener("click", () => sidebarMenu.classList.toggle("open"));
}

// Highlight the active sidebar link
const page = location.pathname.split("/").pop();
document.querySelectorAll(".sidebar ul li a").forEach(a => {
    if (a.getAttribute("href") === page) a.classList.add("active");
});

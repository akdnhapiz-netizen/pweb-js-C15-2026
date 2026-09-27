
const loggedInUser = localStorage.getItem("user");

if (!loggedInUser) {
    window.location.href = "loginpage.html";
} else {
    document.addEventListener("DOMContentLoaded", () => {
        const welcomeUser = document.getElementById("welcomeUser");
        if (welcomeUser) {
            welcomeUser.textContent = `Halo, ${loggedInUser}!`;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "loginpage.html";
        });
    }
});
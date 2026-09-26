const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    loading.textContent = "Sedang login...";
    error.textContent = "";
    loginButton.disabled = true;

    try {

        const response = await fetch("https://dummyjson.com/users");

        if (!response.ok) {
            throw new Error("Gagal mengambil data dari API");
        }

        const data = await response.json();

        const user = data.users.find(function(user) {
            return user.username === username &&
                   user.password === password;
        });

        if (!user) {
            throw new Error("Username atau password salah");
        }

        localStorage.setItem("user", user.firstName);

        loading.textContent = "Login berhasil!";

        window.location.href = "index.html";

    } catch (err) {

        error.textContent = err.message;

    } finally {

        loginButton.disabled = false;

    }
});
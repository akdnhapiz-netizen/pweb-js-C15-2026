let allProducts = [];
let currentFilteredProducts = [];
let displayedCount = 0;
const BATCH_SIZE = 8;

async function loadProducts() {
    try {
        const response = await fetch("https://dummyjson.com/products?limit=0");

        if (!response.ok) {
            throw new Error("Gagal mengambil data produk");
        }

        const data = await response.json();

       allProducts = data.products;
        currentFilteredProducts = allProducts;

        if (allProducts.length === 0) {
            document.getElementById("globalError").textContent = "Tidak ada produk beauty ditemukan.";
            return;
        }

        fillCategoryOptions();
        renderNextBatch();

    } catch (err) {
        document.getElementById("globalError").textContent = err.message;
    }
}

function fillCategoryOptions() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = [...new Set(allProducts.map(p => p.category))];

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

loadProducts();

document.getElementById("productGrid").addEventListener("click", function(event) {
    if (event.target.classList.contains("add-to-cart-btn")) {
        addToCart(event.target.dataset.id);
        return;
    }

    const card = event.target.closest(".product-card");
    if (card) {
        openProductModal(card.dataset.id);
    }
});

const modalOverlay = document.getElementById("modalOverlay");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === parseInt(productId));
    if (!product) return;

    modalBody.innerHTML = `
        <span class="category-tag">${product.category}</span>
        <h2>${product.title}</h2>
        <p>Brand: ${product.brand || "-"}</p>
        <p class="price">$${product.price.toFixed(2)} <span class="rating">★ ${product.rating}</span></p>
        <p>Stok tersedia: ${product.stock}</p>
        <p>${product.description}</p>
        <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
    `;

    modalOverlay.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
});

modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
    }
});

modalBody.addEventListener("click", function(event) {
    if (event.target.classList.contains("add-to-cart-btn")) {
        addToCart(event.target.dataset.id);
    }
});
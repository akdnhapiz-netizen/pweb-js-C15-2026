/* ========================================================
   FITUR INTERAKTIF (SEARCH, FILTER, SORT, CART, LOAD MORE)
   ======================================================== */

// --- 1. AUTENTIKASI ---
const loggedInUser = localStorage.getItem("user");

if (!loggedInUser) {
    window.location.href = "loginpage.html";
} else {
    document.getElementById("welcomeUser").textContent = `Halo, ${loggedInUser}!`;
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "loginpage.html";
});


// --- 2. MANAJEMEN KERANJANG BELANJA (CRUD & PREVIEW) ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById('cartBadge');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');

// Elemen panel keranjang
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartPanelTotal = document.getElementById('cartPanelTotal');
const viewCartBtn = document.getElementById('viewCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// READ: tampilkan isi keranjang di panel
function renderCart() {
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Keranjang masih kosong</p>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
            <img src="${item.thumbnail}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            <div class="cart-item-info" style="flex-grow: 1;">
                <h4 style="margin: 0; font-size: 14px;">${item.title}</h4>
                <span style="font-size: 12px;">$${item.price.toFixed(2)} x ${item.qty} = <strong>$${(item.price * item.qty).toFixed(2)}</strong></span>
                <div class="qty-control" style="margin-top: 5px;">
                    <button data-action="decrease" data-id="${item.id}">-</button>
                    <span style="margin: 0 5px;">${item.qty}</span>
                    <button data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-action="remove" data-id="${item.id}" style="background: red; color: white; border: none; padding: 5px; cursor: pointer; border-radius: 3px;">Hapus</button>
        </div>
    `).join('');
}

// Perbarui badge, total harga, dan panel keranjang
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartBadge) cartBadge.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = `($${totalPrice.toFixed(2)})`;
    if (cartPanelTotal) cartPanelTotal.textContent = `$${totalPrice.toFixed(2)}`;

    renderCart();
}

updateCartUI();

// CREATE: masukkan barang ke keranjang
function addToCart(productId) {
    const product = allProducts.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartUI();
}

// UPDATE: ubah jumlah
function changeQty(productId, amount) {
    const item = cart.find(i => i.id === parseInt(productId));
    if (!item) return;

    item.qty += amount;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartUI();
}

// DELETE: hapus satu barang
function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== parseInt(productId));
    saveCart();
    updateCartUI();
}

// DELETE: kosongkan keranjang
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        localStorage.removeItem('cart');
        updateCartUI();
    });
}

// Klik tombol +, -, Hapus di dalam panel
if (cartItems) {
    cartItems.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.dataset.id;
        if (btn.dataset.action === 'remove') removeFromCart(id);
        if (btn.dataset.action === 'increase') changeQty(id, 1);
        if (btn.dataset.action === 'decrease') changeQty(id, -1);
    });
}

// Buka / tutup panel & checkout
if (viewCartBtn) viewCartBtn.addEventListener('click', () => cartPanel.classList.remove('hidden'));
if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartPanel.classList.add('hidden'));

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        if (confirm(`Checkout ${cart.length} jenis barang, total $${total.toFixed(2)}?`)) {
            cart = [];
            localStorage.removeItem('cart');
            updateCartUI();
            cartPanel.classList.add('hidden');
            alert('Checkout berhasil!');
        }
    });
}


// --- 3. GRID PRODUK & LOAD MORE ---
// Catatan: klik "Tambah ke Keranjang" sudah ditangani di product.js,
// jadi tidak dipasang lagi di sini supaya tidak terhitung dua kali.
const loadMoreBtn = document.getElementById('loadMoreBtn');
const productGrid = document.getElementById('productGrid');
const resultCount = document.getElementById('resultCount');

function renderNextBatch() {
    const nextBatch = currentFilteredProducts.slice(displayedCount, displayedCount + BATCH_SIZE);

    nextBatch.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card product-card';
        card.dataset.id = product.id;
        card.innerHTML = `
            <div class="card-img-container">
                <span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>
                <img src="${product.thumbnail}" alt="${product.title}" class="card-img" loading="lazy">
            </div>
            <div class="card-content">
                <span class="category-tag">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <div class="price-row">
                    <span class="price">$${product.price.toFixed(2)}</span>
                    <span class="rating">★ ${product.rating}</span>
                </div>
                <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
            </div>
        `;
        productGrid.appendChild(card);
    });

    displayedCount += nextBatch.length;
    resultCount.textContent = `Menampilkan ${displayedCount} dari ${currentFilteredProducts.length} produk`;

    if (displayedCount >= currentFilteredProducts.length) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

loadMoreBtn.addEventListener('click', renderNextBatch);


// --- 4. PENCARIAN, FILTER, DAN SORTING ---
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');

function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCat = categoryFilter.value;
    const sortMode = sortSelect.value;

    currentFilteredProducts = allProducts.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm) || p.category.toLowerCase().includes(searchTerm);
        const matchCat = (selectedCat === 'all') || (p.category === selectedCat);
        return matchSearch && matchCat;
    });

    if (sortMode === 'price-low') {
        currentFilteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-high') {
        currentFilteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'rating-high') {
        currentFilteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === 'rating-low') {
        currentFilteredProducts.sort((a, b) => a.rating - b.rating);
    }

    productGrid.innerHTML = '';
    displayedCount = 0;
    renderNextBatch();
}

categoryFilter.addEventListener('change', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const handleSearch = debounce(() => {
    applyFiltersAndSort();
}, 500);

searchInput.addEventListener('input', handleSearch);
/* ========================================================
   FITUR INTERAKTIF (SEARCH, FILTER, SORT, CART, LOAD MORE)
   ======================================================== */

// 1. INISIALISASI SHOPPING CART DARI LOCAL STORAGE (CRUD: Read)
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById('cartBadge');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');

// Fungsi untuk memperbarui UI Badge & Total Harga
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    cartBadge.textContent = totalItems;
    cartTotal.textContent = `($${totalPrice.toFixed(2)})`;
}

// Panggil fungsi UI cart saat halaman pertama kali dimuat
updateCartUI();

// Fungsi Tambah ke Keranjang (CRUD: Create & Update)
// (Fungsi ini akan dipanggil lewat Event Delegation saat tombol 'Tambah ke Keranjang' diklik)
function addToCart(productId) {
    const product = allProducts.find(p => p.id === parseInt(productId));
    if (!product) return;

    // Cek apakah barang sudah ada di keranjang
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1; // Jika ada, update kuantitas (jangan buat duplikat)
    } else {
        cart.push({...product, qty: 1 }); // Jika belum ada, masukkan ke array
    }

    // Simpan ke Local Storage (CRUD: Create/Update)
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Fungsi Kosongkan Keranjang (CRUD: Delete)
clearCartBtn.addEventListener('click', () => {
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
});


// 2. LOAD MORE / PAGINATION DENGAN array.slice()
const loadMoreBtn = document.getElementById('loadMoreBtn');
const productGrid = document.getElementById('productGrid');
const resultCount = document.getElementById('resultCount');

function renderNextBatch() {
    // Memotong array menggunakan slice() sesuai requirement
    const nextBatch = currentFilteredProducts.slice(displayedCount, displayedCount + BATCH_SIZE);

    // Looping untuk merender kartu
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

    // Sembunyikan tombol Load More jika semua produk sudah tampil
    if (displayedCount >= currentFilteredProducts.length) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

// Event klik tombol Load More
loadMoreBtn.addEventListener('click', renderNextBatch);


// 3. FILTER KATEGORI & SORTING (Functional Programming)
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');

function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCat = categoryFilter.value;
    const sortMode = sortSelect.value;

    // A. Filter berdasarkan Search (Nama/Kategori) DAN Kategori Dropdown
    currentFilteredProducts = allProducts.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm) || p.category.toLowerCase().includes(searchTerm);
        const matchCat = (selectedCat === 'all') || (p.category === selectedCat);
        return matchSearch && matchCat;
    });

    // B. Sorting menggunakan .sort() tanpa merusak data asli allProducts
    if (sortMode === 'price-low') {
        currentFilteredProducts.sort((a, b) => a.price - b.price); // Termurah
    } else if (sortMode === 'price-high') {
        currentFilteredProducts.sort((a, b) => b.price - a.price); // Termahal
    } else if (sortMode === 'rating-high') {
        currentFilteredProducts.sort((a, b) => b.rating - a.rating); // Rating Tertinggi
    } else if (sortMode === 'rating-low') {
        currentFilteredProducts.sort((a, b) => a.rating - b.rating); // Rating Terendah
    }

    // Reset grid & render ulang dari index 0
    productGrid.innerHTML = '';
    displayedCount = 0;
    renderNextBatch();
}

categoryFilter.addEventListener('change', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);


// 4. REAL-TIME SEARCH (DEBOUNCE & CLOSURE)
// Fungsi Debounce menggunakan konsep Closure
function debounce(func, delay) {
    let timer; // Variabel 'timer' dipertahankan oleh Closure
    return function(...args) {
        clearTimeout(timer); // Hapus timer lama jika user mengetik lagi
        timer = setTimeout(() => {
            func.apply(this, args); // Jalankan filter setelah delay selesai
        }, delay);
    };
}

// Membungkus fungsi applyFiltersAndSort ke dalam debounce dengan jeda 500ms
const handleSearch = debounce(() => {
    applyFiltersAndSort();
}, 500);

// Event listener pada input text akan memanggil fungsi yang sudah di-debounce
searchInput.addEventListener('input', handleSearch);
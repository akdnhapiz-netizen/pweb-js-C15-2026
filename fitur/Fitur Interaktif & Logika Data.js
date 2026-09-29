/* ========================================================
   FITUR INTERAKTIF (SEARCH, FILTER, SORT, CART, LOAD MORE)
   ======================================================== */

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById('cartBadge');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    cartBadge.textContent = totalItems;
    cartTotal.textContent = `($${totalPrice.toFixed(2)})`;
}

updateCartUI();

function addToCart(productId) {
    const product = allProducts.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1; 
        cart.push({...product, qty: 1 }); 
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

clearCartBtn.addEventListener('click', () => {
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
});


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
        currentFilteredProducts.sort((a, b) => a.price - b.price); // Termurah
    } else if (sortMode === 'price-high') {
        currentFilteredProducts.sort((a, b) => b.price - a.price); // Termahal
    } else if (sortMode === 'rating-high') {
        currentFilteredProducts.sort((a, b) => b.rating - a.rating); // Rating Tertinggi
    } else if (sortMode === 'rating-low') {
        currentFilteredProducts.sort((a, b) => a.rating - b.rating); // Rating Terendah
    }

    productGrid.innerHTML = '';
    displayedCount = 0;
    renderNextBatch();
}

categoryFilter.addEventListener('change', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);


function debounce(func, delay) {
    let timer; 
    return function(...args) {
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
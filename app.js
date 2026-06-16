// --- MOCK DATABASE SEED DATA ---
const SEED_PRODUCTS = [
    {
        id: "shoe-1",
        title: "Nepzo Volt Pro Running Shoes",
        category: "footwear",
        brand: "nepzo",
        price: 3700,
        rating: 4.8,
        reviewsCount: 124,
        image: "assets/shoe_runner.png",
        description: "Experience maximum energy return with the Nepzo Volt Pro. Designed with advanced lightweight breathable mesh and a responsive neon cushioning sole, it's perfect for both competitive road running and active daily wear.",
        sizes: [40, 41, 42, 43, 44],
        badge: "Hot"
    },
    {
        id: "shoe-2",
        title: "Casual Platform Sneakers",
        category: "footwear",
        brand: "nepzo",
        price: 3500,
        rating: 4.6,
        reviewsCount: 89,
        image: "assets/shoe_classic.png",
        description: "A perfect blend of vintage retro style and modern comfort. The Urban Glide features a cream leather outer with iconic dark green accents and a vulcanized tan rubber sole for excellent grip and long-lasting durability.",
        sizes: [39, 40, 41, 42, 43],
        badge: "New"
    },
    {
        id: "shoe-3",
        title: "New Thick-Soled Tendy Men's Shoes",
        category: "footwear",
        brand: "nepzo",
        price: 3500,
        rating: 4.7,
        reviewsCount: 96,
        image: "assets/shoe_casual.png",
        description: "Make a statement on the streets. Featuring a striking purple and white modern leather silhouette, padded ankle support, and soft inner lining, this sneaker delivers exceptional comfort and outstanding street credentials.",
        sizes: [40, 41, 42, 43, 44],
        badge: "Popular"
    },
    {
        id: "shoe-4",
        title: "Nike Air Zoom Pegasus 40",
        category: "footwear",
        brand: "nike",
        price: 3500,
        rating: 4.9,
        reviewsCount: 250,
        image: "assets/shoe_trending.png",
        description: "The trusted workhorse with wings returns. The Air Zoom Pegasus 40 features lightweight responsive cushioning, secure midfoot lock, and breathable design to keep you comfortable during long runs.",
        sizes: [40, 41, 42, 43, 44],
        badge: "Premium"
    },
    {
        id: "shoe-5",
        title: "Adidas Ultraboost Light",
        category: "footwear",
        brand: "adidas",
        price: 15999,
        rating: 4.8,
        reviewsCount: 180,
        image: "assets/shoe_fashion.png",
        description: "Experience epic energy with the Adidas Ultraboost Light. Features an innovative Boost capsule midsole, adaptive knit upper, and continental rubber outsole for top-tier performance and cushioning.",
        sizes: [40, 41, 42, 43, 44],
        badge: "Top Tier"
    },
    {
        id: "shoe-6",
        title: "Puma RS-X Geek Sneakers",
        category: "footwear",
        brand: "puma",
        price: 9999,
        rating: 4.5,
        reviewsCount: 74,
        image: "assets/shoe_casual.png",
        description: "The RS-X is back. This retro-futuristic silhouette returns with a progressive design, tech-inspired detailing, and mixed material overlays to offer ultimate cushioning and visual style.",
        sizes: [39, 40, 41, 42, 43],
        badge: "Trending"
    }
];

// --- STATE MANAGEMENT ---
let products = [];
let cart = [];
let orders = [];
let currentCategory = "footwear";
let isAdminLoggedIn = false;

// Store Information
const STORE_WHATSAPP = "9779801315885"; // Owner number
const SHIPPING_INSIDE = 100;
const SHIPPING_OUTSIDE = 200;

// ⚠️ Increment this number whenever you change prices or seed products
// This forces the browser to clear old cached data and load fresh prices
const DB_VERSION = "3";

// Initialize Database from LocalStorage
function initDB() {
    // If the version has changed, wipe cached products and reload fresh from code
    if (localStorage.getItem("nepzo_db_version") !== DB_VERSION) {
        localStorage.removeItem("nepzo_products");
        localStorage.setItem("nepzo_db_version", DB_VERSION);
    }

    if (!localStorage.getItem("nepzo_products")) {
        localStorage.setItem("nepzo_products", JSON.stringify(SEED_PRODUCTS));
    }
    products = JSON.parse(localStorage.getItem("nepzo_products"));

    if (!localStorage.getItem("nepzo_cart")) {
        localStorage.setItem("nepzo_cart", JSON.stringify([]));
    }
    cart = JSON.parse(localStorage.getItem("nepzo_cart"));

    if (!localStorage.getItem("nepzo_orders")) {
        localStorage.setItem("nepzo_orders", JSON.stringify([]));
    }
    orders = JSON.parse(localStorage.getItem("nepzo_orders"));
}

// Save data helpers
function saveProducts() {
    localStorage.setItem("nepzo_products", JSON.stringify(products));
}
function saveCart() {
    localStorage.setItem("nepzo_cart", JSON.stringify(cart));
}
function saveOrders() {
    localStorage.setItem("nepzo_orders", JSON.stringify(orders));
}

// --- APP ROUTING & VIEWS CONTROLLER ---
function handleRouting() {
    const hash = window.location.hash || "#shop";
    
    // Hide all views first
    document.getElementById("shopView").style.display = "none";
    document.getElementById("aboutView").style.display = "none";
    document.getElementById("contactView").style.display = "none";
    document.getElementById("adminView").style.display = "none";
    
    // Deactivate nav links
    document.getElementById("navShop").classList.remove("active");
    document.getElementById("navAbout").classList.remove("active");
    document.getElementById("navContact").classList.remove("active");
    document.getElementById("navAdmin").classList.remove("active");

    if (hash === "#shop" || hash.startsWith("#catalog")) {
        document.getElementById("shopView").style.display = "block";
        document.getElementById("navShop").classList.add("active");
        renderCatalog();
    } else if (hash === "#about") {
        document.getElementById("aboutView").style.display = "block";
        document.getElementById("navAbout").classList.add("active");
    } else if (hash === "#contact") {
        document.getElementById("contactView").style.display = "block";
        document.getElementById("navContact").classList.add("active");
    } else if (hash === "#admin") {
        document.getElementById("navAdmin").classList.add("active");
        if (isAdminLoggedIn) {
            document.getElementById("adminView").style.display = "block";
            renderAdminDashboard();
        } else {
            promptAdminLogin();
        }
    }
    
    // Close cart drawer on route change
    closeCart();
}

// Admin login verification
function promptAdminLogin() {
    const password = prompt("Enter Admin Password to access dashboard (Default: admin123):");
    if (password === "admin123") {
        isAdminLoggedIn = true;
        document.getElementById("adminView").style.display = "block";
        renderAdminDashboard();
    } else {
        alert("Incorrect Password! Returning to Shop.");
        window.location.hash = "#shop";
    }
}

// --- CATALOG RENDERING & SEARCH ---
function renderCatalog() {
    const grid = document.getElementById("productGrid");
    const searchVal = document.getElementById("searchInput").value.toLowerCase();
    const brandVal = document.getElementById("brandFilter").value;
    const sortVal = document.getElementById("sortFilter").value;

    let filtered = products.filter(p => p.category === currentCategory);

    // Search query filter
    if (searchVal) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchVal) || 
            p.brand.toLowerCase().includes(searchVal) || 
            p.description.toLowerCase().includes(searchVal)
        );
    }

    // Brand filter
    if (brandVal !== "all") {
        filtered = filtered.filter(p => p.brand.toLowerCase() === brandVal);
    }

    // Sorting
    if (sortVal === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortVal === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortVal === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    // Populate DOM
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>No Products Found</h3>
                <p>Try resetting your filter options or typing a different search query.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            ${product.badge ? `<span class="product-card-badge badge badge-new">${product.badge}</span>` : ""}
            <div class="product-card-image" onclick="openProductDetail('${product.id}')" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-card-info">
                <span class="product-card-category">${product.brand} • ${product.category}</span>
                <h3 class="product-card-title" onclick="openProductDetail('${product.id}')">${product.title}</h3>
                <div class="product-card-rating">
                    ${renderStars(product.rating)}
                    <span>(${product.reviewsCount || 0})</span>
                </div>
                <div class="product-card-footer">
                    <span class="product-card-price">Rs. ${product.price.toLocaleString()}</span>
                    <button class="add-cart-btn" onclick="quickAddCart('${product.id}')" aria-label="Add to cart">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function renderStars(rating) {
    let starsHtml = "";
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fa-solid fa-star"></i>';
    }
    if (halfStar) {
        starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = 5 - fullStars - halfStar;
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="fa-regular fa-star"></i>';
    }
    return starsHtml;
}

// Category tabs click handler
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        const cat = this.getAttribute("data-category");
        
        // Show demo lock notification for Apparel/Accessories since we are starting with shoes
        if (cat === "apparel" || cat === "accessories") {
            alert(`Thanks for your interest! Nepzo Store is currently focusing on premium Footwear. The ${cat.toUpperCase()} collection is expanding and will launch very soon!`);
            return;
        }

        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        
        currentCategory = cat;
        document.getElementById("catalogTitle").innerText = `Our ${cat.charAt(0).toUpperCase() + cat.slice(1)} Collection`;
        renderCatalog();
    });
});

// --- PRODUCT DETAILS MODAL ---
let activeModalProduct = null;
let selectedSize = null;

function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    activeModalProduct = product;
    selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;

    const modalDetails = document.getElementById("modalProductDetails");
    
    modalDetails.innerHTML = `
        <div class="product-details-gallery">
            <img src="${product.image}" alt="${product.title}" id="modalMainImg">
        </div>
        
        <div class="product-details-info">
            <span class="product-card-category">${product.brand} • ${product.category}</span>
            <h2 class="product-details-title">${product.title}</h2>
            
            <div class="product-card-rating">
                ${renderStars(product.rating)}
                <span style="color: var(--text-main); font-weight:600;">${product.rating}</span>
                <span>(${product.reviewsCount || 0} reviews)</span>
            </div>
            
            <div class="product-details-price">Rs. ${product.price.toLocaleString()}</div>
            
            <p class="product-details-desc">${product.description}</p>
            
            ${product.sizes && product.sizes.length > 0 ? `
                <div>
                    <div class="product-selector-title">Select Sizing (EU)</div>
                    <div class="size-options">
                        ${product.sizes.map((sz, index) => `
                            <button class="size-chip ${index === 0 ? "active" : ""}" onclick="selectProductSize(${sz}, this)">${sz}</button>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
            
            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
                <div class="product-selector-title">Quantity</div>
                <div style="display:flex; gap:1.5rem; align-items:center;">
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="adjustModalQty(-1)">-</button>
                        <span class="qty-value" id="modalQtyVal">1</span>
                        <button class="qty-btn" onclick="adjustModalQty(1)">+</button>
                    </div>
                    
                    <button class="btn-primary" style="flex-grow:1;" onclick="addActiveProductToCart()">
                        <i class="fa-solid fa-cart-plus"></i> Add To Bag
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("productModal").classList.add("active");
}

function closeProductModal() {
    document.getElementById("productModal").classList.remove("active");
    activeModalProduct = null;
}

function selectProductSize(size, element) {
    selectedSize = size;
    const parent = element.parentElement;
    parent.querySelectorAll(".size-chip").forEach(chip => chip.classList.remove("active"));
    element.classList.add("active");
}

function adjustModalQty(change) {
    const qtyEl = document.getElementById("modalQtyVal");
    let val = parseInt(qtyEl.innerText) + change;
    if (val < 1) val = 1;
    qtyEl.innerText = val;
}

function addActiveProductToCart() {
    if (!activeModalProduct) return;
    
    const qty = parseInt(document.getElementById("modalQtyVal").innerText);
    addToCart(activeModalProduct.id, selectedSize, qty);
    closeProductModal();
}

// --- SHOPPING CART SYSTEM ---
function openCart() {
    document.getElementById("cartOverlay").classList.add("active");
    updateCartUi();
}

function closeCart() {
    document.getElementById("cartOverlay").classList.remove("active");
}

function quickAddCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Add default size if footwear
    const defaultSz = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    addToCart(productId, defaultSz, 1);
    
    // Quick success alert
    openCart();
}

function addToCart(productId, size, qty) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if item already exists in cart with same size
    const existingIndex = cart.findIndex(item => item.product.id === productId && item.size === size);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({
            product: product,
            size: size,
            quantity: qty
        });
    }

    saveCart();
    updateCartUi();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUi();
}

function updateCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUi();
}

function updateCartUi() {
    const list = document.getElementById("cartItemsList");
    const countEl = document.getElementById("cartCount");
    
    // Cart totals elements
    const subtotalEl = document.getElementById("cartSubtotal");
    const shippingEl = document.getElementById("cartShipping");
    const totalEl = document.getElementById("cartTotal");

    // Count summary
    const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    countEl.innerText = totalItemsCount;

    if (cart.length === 0) {
        list.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Your bag is empty.</p>
                <button class="btn-secondary" onclick="closeCart()">Continue Shopping</button>
            </div>
        `;
        subtotalEl.innerText = "Rs. 0";
        shippingEl.innerText = "Rs. 0";
        totalEl.innerText = "Rs. 0";
        document.getElementById("toCheckoutBtn").disabled = true;
        return;
    }

    document.getElementById("toCheckoutBtn").disabled = false;

    // Render items
    list.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.product.image}" alt="${item.product.title}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.product.title}</h4>
                <div class="cart-item-meta">
                    ${item.size ? `Size: ${item.size} | ` : ""}Brand: ${item.product.brand}
                </div>
                <div class="cart-item-footer">
                    <span class="cart-item-price">Rs. ${(item.product.price * item.quantity).toLocaleString()}</span>
                    <div class="quantity-selector" style="padding:0;">
                        <button class="qty-btn" style="width:24px; height:24px;" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="qty-value" style="width:20px; font-size:0.85rem;">${item.quantity}</span>
                        <button class="qty-btn" style="width:24px; height:24px;" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join("");

    // Calculate subtotal
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    
    // Get shipping option (inside valley default until checkout is opened)
    const isCheckoutOpen = document.getElementById("checkoutModal").classList.contains("active");
    const citySelect = document.getElementById("custCity");
    let shipping = SHIPPING_INSIDE;
    
    if (isCheckoutOpen && citySelect) {
        shipping = citySelect.value === "inside" ? SHIPPING_INSIDE : SHIPPING_OUTSIDE;
    }

    subtotalEl.innerText = `Rs. ${subtotal.toLocaleString()}`;
    shippingEl.innerText = `Rs. ${shipping.toLocaleString()}`;
    totalEl.innerText = `Rs. ${(subtotal + shipping).toLocaleString()}`;
}

// --- CHECKOUT & ORDER HANDLING ---
function openCheckout() {
    closeCart();
    
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = document.getElementById("custCity").value === "inside" ? SHIPPING_INSIDE : SHIPPING_OUTSIDE;

    document.getElementById("summarySubtotal").innerText = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById("summaryShipping").innerText = `Rs. ${shipping.toLocaleString()}`;
    document.getElementById("summaryTotal").innerText = `Rs. ${(subtotal + shipping).toLocaleString()}`;

    document.getElementById("checkoutModal").classList.add("active");
}

function closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("active");
}

// Shipping selection update prices
document.getElementById("custCity").addEventListener("change", function() {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = this.value === "inside" ? SHIPPING_INSIDE : SHIPPING_OUTSIDE;

    document.getElementById("summaryShipping").innerText = `Rs. ${shipping.toLocaleString()}`;
    document.getElementById("summaryTotal").innerText = `Rs. ${(subtotal + shipping).toLocaleString()}`;
});

// Toggle digital QR scanner panel
document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
    radio.addEventListener("change", function() {
        const qrPanel = document.getElementById("walletQrDetailsPanel");
        const payOptCod = document.getElementById("payOptCod");
        const payOptWallet = document.getElementById("payOptWallet");

        if (this.value === "Digital") {
            qrPanel.style.display = "block";
            payOptWallet.classList.add("active");
            payOptCod.classList.remove("active");
        } else {
            qrPanel.style.display = "none";
            payOptCod.classList.add("active");
            payOptWallet.classList.remove("active");
        }
    });
});

// Handle order submission
document.getElementById("checkoutForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const email = document.getElementById("custEmail").value.trim() || "N/A";
    const address = document.getElementById("custAddress").value.trim();
    const cityOpt = document.getElementById("custCity").value;
    const city = cityOpt === "inside" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley";
    const payment = document.querySelector('input[name="payMethod"]:checked').value === "COD" ? "Cash on Delivery" : "Wallet QR Transfer";

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = cityOpt === "inside" ? SHIPPING_INSIDE : SHIPPING_OUTSIDE;
    const total = subtotal + shipping;

    const orderId = "NPZ-" + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

    // Store in Orders DB
    const newOrder = {
        id: orderId,
        date: orderDate,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        address: `${address}, ${city}`,
        items: cart.map(item => ({
            id: item.product.id,
            title: item.product.title,
            size: item.size,
            quantity: item.quantity,
            price: item.product.price
        })),
        total: total,
        paymentMethod: payment,
        status: "Pending"
    };

    orders.unshift(newOrder); // Add to beginning
    saveOrders();

    // Compile WhatsApp string
    let itemDetailsStr = "";
    cart.forEach(item => {
        itemDetailsStr += `- ${item.product.title} ${item.size ? `(Size ${item.size})` : ""} x ${item.quantity} - Rs. ${(item.product.price * item.quantity).toLocaleString()}\n`;
    });

    const waText = `*NEW ORDER - NEPZO STORE* 🛍️\n` +
                   `Order ID: #${orderId}\n\n` +
                   `*Customer Details:*\n` +
                   `Name: ${name}\n` +
                   `Phone: ${phone}\n` +
                   `Address: ${address}, ${city}\n` +
                   `Payment Method: ${payment}\n\n` +
                   `*Items Ordered:*\n` +
                   `${itemDetailsStr}\n` +
                   `*Order Summary:*\n` +
                   `Subtotal: Rs. ${subtotal.toLocaleString()}\n` +
                   `Shipping: Rs. ${shipping.toLocaleString()}\n` +
                   `*Total Payable: Rs. ${total.toLocaleString()}*\n\n` +
                   `Please confirm my order. Thank you!`;

    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodedText}`;

    // Update Success screen elements
    document.getElementById("successCustName").innerText = name;
    document.getElementById("successCustPhone").innerText = phone;
    document.getElementById("successCustTotal").innerText = `Rs. ${total.toLocaleString()}`;
    document.getElementById("successOrderId").innerText = orderId;

    // Attach Whatsapp URL trigger to success buttons
    const waTrigger = () => {
        window.open(waUrl, "_blank");
    };
    document.getElementById("successWaBtn").onclick = waTrigger;

    // Clear Cart
    cart = [];
    saveCart();
    updateCartUi();

    // Reset Forms
    document.getElementById("checkoutForm").reset();
    document.getElementById("walletQrDetailsPanel").style.display = "none";
    document.getElementById("payOptCod").classList.add("active");
    document.getElementById("payOptWallet").classList.remove("active");

    // Close checkout and trigger Success Modal
    closeCheckout();
    document.getElementById("successModal").classList.add("active");

    // Auto trigger redirection after 2.5 seconds
    setTimeout(() => {
        if (document.getElementById("successModal").classList.contains("active")) {
            waTrigger();
        }
    }, 2500);
});

// Close success screen
document.getElementById("successCloseBtn").addEventListener("click", function() {
    document.getElementById("successModal").classList.remove("active");
    window.location.hash = "#shop";
});

// --- ADMIN DASHBOARD MODULE ---
function renderAdminDashboard() {
    const revenueEl = document.getElementById("statRevenue");
    const ordersEl = document.getElementById("statOrders");
    const productsEl = document.getElementById("statProducts");
    const ordersTable = document.getElementById("adminOrdersTable");
    const inventoryList = document.getElementById("adminInventoryList");

    // Calculate revenue (only count pending, shipped, and completed - filter out cancelled)
    const validOrders = orders.filter(o => o.status !== "Cancelled");
    const totalRev = validOrders.reduce((acc, o) => acc + o.total, 0);
    
    revenueEl.innerText = `Rs. ${totalRev.toLocaleString()}`;
    ordersEl.innerText = orders.length;
    productsEl.innerText = products.length;

    // Populate Orders Table
    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No orders registered yet.</td>
            </tr>
        `;
    } else {
        ordersTable.innerHTML = orders.map(order => {
            const itemsStr = order.items.map(i => `${i.title} (${i.size ? `Size ${i.size}` : "N/A"}) x ${i.quantity}`).join("<br>");
            return `
                <tr>
                    <td style="font-weight:700;">#${order.id}</td>
                    <td>${order.date}</td>
                    <td>
                        <strong>${order.customerName}</strong><br>
                        <span style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-phone"></i> ${order.customerPhone}</span>
                    </td>
                    <td>${order.address}</td>
                    <td style="font-size:0.85rem; line-height:1.4;">${itemsStr}</td>
                    <td style="color:var(--primary); font-weight:700;">Rs. ${order.total.toLocaleString()}</td>
                    <td><span class="badge" style="background:rgba(255,255,255,0.05); color:var(--text-main); border:1px solid var(--border-color);">${order.paymentMethod}</span></td>
                    <td>
                        <select class="status-select ${order.status.toLowerCase()}" onchange="changeOrderStatus('${order.id}', this)">
                            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                            <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                            <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <div class="admin-actions-cell">
                            <button class="admin-btn-icon delete" onclick="deleteOrder('${order.id}')" title="Delete Order"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Populate Catalog Inventory items
    inventoryList.innerHTML = products.map(product => `
        <div class="inventory-item">
            <img src="${product.image}" alt="${product.title}">
            <h4 class="inventory-title">${product.title}</h4>
            <span class="inventory-price">Rs. ${product.price.toLocaleString()}</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">${product.brand} | ${product.category}</span>
            <button class="inventory-delete" onclick="deleteProduct('${product.id}')" title="Delete Product"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join("");
}

function changeOrderStatus(orderId, selectElement) {
    const status = selectElement.value;
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = status;
        saveOrders();
        
        // Dynamic class colors
        selectElement.className = `status-select ${status.toLowerCase()}`;
        
        // Refresh revenue
        renderAdminDashboard();
    }
}

function deleteOrder(orderId) {
    if (confirm(`Are you sure you want to delete order #${orderId}? This cannot be undone.`)) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrders();
        renderAdminDashboard();
    }
}

function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product from the store catalog?")) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderAdminDashboard();
        renderCatalog();
    }
}

// Add product Form logic
document.getElementById("addProductForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("prodTitle").value.trim();
    const category = document.getElementById("prodCategory").value;
    const brand = document.getElementById("prodBrand").value.trim();
    const price = parseInt(document.getElementById("prodPrice").value);
    const rating = parseFloat(document.getElementById("prodRating").value) || 4.5;
    const image = document.getElementById("prodImage").value;
    const description = document.getElementById("prodDesc").value.trim();

    const newProduct = {
        id: "shoe-" + Date.now(),
        title: title,
        category: category,
        brand: brand,
        price: price,
        rating: rating,
        reviewsCount: 1,
        image: image,
        description: description,
        sizes: [40, 41, 42, 43, 44],
        badge: "New"
    };

    products.push(newProduct);
    saveProducts();
    
    // Close modal & reset form
    document.getElementById("addProductModal").classList.remove("active");
    document.getElementById("addProductForm").reset();

    // Reload views
    renderAdminDashboard();
    renderCatalog();
});

// Logout Admin
document.getElementById("logoutAdminBtn").addEventListener("click", function() {
    isAdminLoggedIn = false;
    window.location.hash = "#shop";
});

// --- GLOBAL EVENT LISTENERS ---
window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", () => {
    initDB();
    handleRouting();
    updateCartUi();
});

// Dialog button selectors
document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", function(e) {
    if (e.target === this) closeCart();
});

document.getElementById("closeProductModalBtn").addEventListener("click", closeProductModal);
document.getElementById("productModal").addEventListener("click", function(e) {
    if (e.target === this) closeProductModal();
});

document.getElementById("closeCheckoutModalBtn").addEventListener("click", closeCheckout);
document.getElementById("checkoutModal").addEventListener("click", function(e) {
    if (e.target === this) closeCheckout();
});

document.getElementById("toCheckoutBtn").addEventListener("click", openCheckout);

// Search & Filter event listeners
document.getElementById("searchInput").addEventListener("keyup", renderCatalog);
document.getElementById("brandFilter").addEventListener("change", renderCatalog);
document.getElementById("sortFilter").addEventListener("change", renderCatalog);

// Admin controls
document.getElementById("openAddProductModalBtn").addEventListener("click", () => {
    document.getElementById("addProductModal").classList.add("active");
});
document.getElementById("closeAddProductModalBtn").addEventListener("click", () => {
    document.getElementById("addProductModal").classList.remove("active");
});
document.getElementById("addProductModal").addEventListener("click", function(e) {
    if (e.target === this) {
        this.classList.remove("active");
    }
});

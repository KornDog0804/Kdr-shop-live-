// Force loading screen to hide after a short delay (failsafe)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      console.log('Loading screen force-hidden by startup code');
    }
  }, 3000); // 3 seconds
});

// Safe localStorage wrapper
function safeGetItem(key, defaultValue = null) {
  try {
    if (typeof Storage !== "undefined" && localStorage) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  return defaultValue;
}

function safeSetItem(key, value) {
  try {
    if (typeof Storage !== "undefined" && localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  return false;
}

// Global state with safe localStorage
const state = {
  cart: safeGetItem("kdr_cart", []),
  products: safeGetItem("kdr_products", []),
  currentSection: 'home',
  currentFilter: null,
  isAdmin: false,
  editingProduct: null
};

// Default products - YOUR ACTUAL INVENTORY
if (state.products.length === 0) {
  state.products = [
    // Vinyl Records
    {
      id: 1,
      title: "Pink Floyd - Dark Side of the Moon",
      price: 29.99,
      imageFront: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      imageBack: null,
      description: "Legendary progressive rock masterpiece on 180g vinyl. A must-have for any serious collector.",
      type: 'vinyl'
    },
    {
      id: 2,
      title: "The Cure - Disintegration",
      price: 32.99,
      imageFront: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      imageBack: null,
      description: "Gothic masterpiece. Dark, atmospheric, and utterly beautiful.",
      type: 'vinyl'
    },
    {
      id: 3,
      title: "My Chemical Romance - Black Parade",
      price: 27.99,
      imageFront: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      imageBack: null,
      description: "Emo rock opera with theatrical flair. Perfect for dramatic listening sessions.",
      type: 'vinyl'
    },
    
    // Funko Pops
    {
      id: 6,
      title: "Funko Pop! Music - Freddie Mercury",
      price: 19.99,
      imageFront: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      imageBack: null,
      description: "Queen's legendary frontman in his iconic yellow jacket. Limited edition!",
      type: 'funko'
    },
    {
      id: 7,
      title: "Funko Pop! Horror - Pennywise",
      price: 24.99,
      imageFront: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      imageBack: null,
      description: "The dancing clown from IT, with detailed costume and red balloon.",
      type: 'funko'
    },
    
    // CDs
    {
      id: 14,
      title: "The Cure - Seventeen Seconds (Remastered CD)",
      price: 15.99,
      imageFront: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
      imageBack: null,
      description: "Remastered edition of the influential gothic rock album with bonus tracks.",
      type: 'cd'
    },
    
    // Movies
    {
      id: 16,
      title: "The Nightmare Before Christmas (4K)",
      price: 24.99,
      imageFront: "https://images.unsplash.com/photo-1489599328132-64e8ae66db82?w=400",
      imageBack: null,
      description: "Tim Burton's stop-motion classic in stunning 4K Ultra HD with behind-the-scenes content.",
      type: 'movie'
    },
    
    // Collectibles
    {
      id: 18,
      title: "Limited Edition Zombie Kitty Figure",
      price: 49.99,
      imageFront: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
      imageBack: null,
      description: "Exclusive KornDog Records mascot figure. Only 500 made worldwide!",
      type: 'collectible'
    }
  ];
  saveProducts();
}

// SECURE ADMIN SYSTEM
let adminClickCount = 0;
let lastClickTime = 0;
const ADMIN_PASSWORD = "KornDog2025!"; // CHANGE THIS PASSWORD
const CLICK_TIMEOUT = 4000; // 4 seconds

function setupAdminAccess() {
  const adminAccess = document.getElementById('adminAccess');
  if (adminAccess) {
    adminAccess.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const currentTime = Date.now();
      
      // Reset if too much time passed
      if (currentTime - lastClickTime > CLICK_TIMEOUT) {
        adminClickCount = 0;
      }
      
      adminClickCount++;
      lastClickTime = currentTime;
      
      if (adminClickCount >= 5) {
        promptAdminLogin();
        adminClickCount = 0;
      } else if (adminClickCount >= 3) {
        showNotification(`${5 - adminClickCount} more clicks for admin access...`);
      }
    });
  }
}

function promptAdminLogin() {
  if (checkAdminLockout()) {
    showNotification('Admin access temporarily locked due to failed attempts');
    return;
  }
  
  const password = prompt("KornDog Records Admin Access\n\nEnter password:");
  if (password === ADMIN_PASSWORD) {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
      adminBtn.classList.add('show');
      showNotification('Admin access granted!');
      safeSetItem('kdr_failed_attempts', 0); // Clear failed attempts
    }
  } else if (password !== null) {
    let attempts = safeGetItem('kdr_failed_attempts', 0) + 1;
    safeSetItem('kdr_failed_attempts', attempts);
    
    if (attempts >= 3) {
      safeSetItem('kdr_admin_lockout', Date.now());
      showNotification('Admin locked for 10 minutes due to failed attempts');
    } else {
      showNotification(`Incorrect password. ${3 - attempts} attempts remaining`);
    }
  }
}

function checkAdminLockout() {
  const lockoutTime = safeGetItem('kdr_admin_lockout', 0);
  if (lockoutTime) {
    const timeDiff = Date.now() - lockoutTime;
    if (timeDiff < 600000) { // 10 minutes
      return true;
    } else {
      safeSetItem('kdr_admin_lockout', 0);
      safeSetItem('kdr_failed_attempts', 0);
    }
  }
  return false;
}

// Navigation Functions
function goHome() {
  showSection('home');
}

function showSection(sectionName) {
  document.querySelectorAll('.content-area').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = sectionName === 'home' ? 'homeSection' : sectionName;
  const section = document.getElementById(targetSection);
  if (section) {
    section.classList.add('active');
    state.currentSection = sectionName;
    
    if (sectionName === 'store2d') {
      if (state.currentFilter) {
        filterProducts(state.currentFilter);
      } else {
        showCategoryPrompt();
      }
    }
  }
}

function showStore() {
  showSection('store2d');
}

function showStoreCategory(category) {
  showSection('store2d');
  setTimeout(() => {
    filterProducts(category);
  }, 100);
}

function show3DInfo() {
  if (window.innerWidth <= 768) {
    showNotification('3D experience is available on desktop only. Enjoy browsing our collection!');
    showStore();
  } else {
    showNotification('3D experience coming soon! Browse our collection in 2D for now.');
    showStore();
  }
}

// Show category selection prompt
function showCategoryPrompt() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="products-grid-placeholder">
      <i class="fas fa-hand-pointer"></i>
      <h3>Please select a category above</h3>
      <p>Choose from Vinyl, CDs, Funkos, Movies, or Collectibles to browse our products</p>
    </div>
  `;
}

// Product Management
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  if (!state.currentFilter) {
    showCategoryPrompt();
    return;
  }
  
  const filteredProducts = state.currentFilter === 'all' 
    ? state.products 
    : state.products.filter(p => p.type === state.currentFilter);

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="products-grid-placeholder">
        <i class="fas fa-box-open"></i>
        <h3>No products found</h3>
        <p>No ${state.currentFilter === 'all' ? '' : state.currentFilter} products available yet.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredProducts.map(product => `
    <div class="product-card" onclick="flipCard(this)" data-id="${product.id}">
      <div class="product-card-inner">
        <div class="product-card-front">
          <img src="${product.imageFront}" alt="${product.title}" class="product-image" loading="lazy">
          <div class="product-info">
            <div>
              <div class="product-title">${product.title}</div>
              <div class="product-price">$${product.price.toFixed(2)}</div>
              <div class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
              <i class="fas fa-cart-plus"></i>
              Add to Cart
            </button>
          </div>
          <div class="flip-indicator">
            <i class="fas fa-sync-alt"></i>
          </div>
        </div>
        <div class="product-card-back">
          <div class="product-back-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <p class="product-back-description">${product.description}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
              <i class="fas fa-cart-plus"></i>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function flipCard(card) {
  card.classList.toggle('flipped');
}

function filterProducts(type, buttonElement) {
  state.currentFilter = type;
  
  // Update active tab
  if (buttonElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.textContent.trim().toLowerCase().includes(type.toLowerCase())) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  renderProducts();
  
  const count = type === 'all' ? state.products.length : state.products.filter(p => p.type === type).length;
  showNotification(`Showing ${count} ${type === 'all' ? 'items' : type} products`);
}

// Admin Functions
function toggleAdmin() {
  if (checkAdminLockout()) {
    showNotification('Admin access temporarily locked');
    return;
  }

  const adminPanel = document.getElementById('adminPanel');
  if (!adminPanel) return;
  
  state.isAdmin = !state.isAdmin;
  
  if (state.isAdmin) {
    adminPanel.classList.add('show');
    renderInventory();
    setupImageUploads();
  } else {
    adminPanel.classList.remove('show');
  }
}

function setupImageUploads() {
  // Front image upload
  const frontInput = document.getElementById('productImageFront');
  const frontPreview = document.getElementById('imagePreviewFront');
  
  if (frontInput && frontPreview) {
    frontInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          frontPreview.src = event.target.result;
          frontPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Back image upload
  const backInput = document.getElementById('productImageBack');
  const backPreview = document.getElementById('imagePreviewBack');
  
  if (backInput && backPreview) {
    backInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          backPreview.src = event.target.result;
          backPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Form submission
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProduct();
    });
  }
}

function saveProduct() {
  const title = document.getElementById('productTitle').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const description = document.getElementById('productDescription').value.trim();
  const type = document.getElementById('productType').value;
  const productId = document.getElementById('productId').value;
  
  // Get image data from previews
  const frontPreview = document.getElementById('imagePreviewFront');
  const backPreview = document.getElementById('imagePreviewBack');
  
  const imageFront = frontPreview.style.display !== 'none' ? frontPreview.src : null;
  const imageBack = backPreview.style.display !== 'none' ? backPreview.src : null;
  
  if (!title || !price || !description || !type || !imageFront) {
    showNotification('Please fill in all required fields and add a front image');
    return;
  }
  
  if (productId) {
    // Update existing product
    const index = state.products.findIndex(p => p.id.toString() === productId);
    if (index >= 0) {
      state.products[index] = {
        ...state.products[index],
        title,
        price,
        description,
        type,
        imageFront,
        imageBack
      };
      showNotification('Product updated successfully!');
    }
  } else {
    // Add new product
    const newProduct = {
      id: Date.now(),
      title,
      price,
      description,
      type,
      imageFront,
      imageBack
    };
    
    state.products.push(newProduct);
    showNotification('Product added successfully!');
  }
  
  saveProducts();
  resetProductForm();
  renderInventory();
  
  if (state.currentFilter === type || state.currentFilter === 'all') {
    renderProducts();
  }
}

function resetProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('imagePreviewFront').style.display = 'none';
  document.getElementById('imagePreviewBack').style.display = 'none';
  state.editingProduct = null;
}

function editProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  state.editingProduct = product;
  
  document.getElementById('productId').value = product.id;
  document.getElementById('productTitle').value = product.title;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productType').value = product.type;
  
  const frontPreview = document.getElementById('imagePreviewFront');
  if (product.imageFront) {
    frontPreview.src = product.imageFront;
    frontPreview.style.display = 'block';
  }
  
  const backPreview = document.getElementById('imagePreviewBack');
  if (product.imageBack) {
    backPreview.src = product.imageBack;
    backPreview.style.display = 'block';
  }
  
  showNotification('Product loaded for editing');
}

function deleteProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (product && confirm(`Delete "${product.title}"?`)) {
    state.products = state.products.filter(p => p.id !== productId);
    saveProducts();
    renderInventory();
    
    if (state.currentSection === 'store2d') {
      renderProducts();
    }
    
    showNotification('Product deleted');
  }
}

function saveProducts() {
  safeSetItem('kdr_products', state.products);
}

function renderInventory() {
  const inventoryList = document.getElementById('inventoryList');
  if (!inventoryList) return;
  
  const byType = {};
  state.products.forEach(product => {
    if (!byType[product.type]) byType[product.type] = [];
    byType[product.type].push(product);
  });

  let html = `<h3 style="color: var(--accent2); margin-bottom: 1rem;">Inventory (${state.products.length} total)</h3>`;
  
  Object.keys(byType).forEach(type => {
    html += `<h4 style="color: var(--accent1); margin: 1rem 0 0.5rem 0; text-transform: capitalize;">${type}s (${byType[type].length})</h4>`;
    byType[type].forEach(product => {
      html += `
        <div class="inventory-item">
          <div class="inventory-item-title">${product.title}</div>
          <div class="inventory-item-price">$${product.price.toFixed(2)}</div>
          <button class="btn-small btn-edit" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      `;
    });
  });
  
  inventoryList.innerHTML = html;
}

// Cart Functions
function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
  }
}

function addToCart(productId, event) {
  if (event) {
    event.stopPropagation(); // Prevent card flip when clicking the button
  }
  
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = state.cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    state.cart.push({ 
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.imageFront,
      quantity: 1
    });
  }
  
  safeSetItem('kdr_cart', state.cart);
  updateCartUI();
  showNotification(`Added ${product.title} to cart!`);
}

function showCart() {
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartSummary = document.getElementById('cartSummary');
  const paypalContainer = document.getElementById('paypal-button-container');
  
  if (!cartItems || !cartEmpty || !cartSummary) return;
  
  if (state.cart.length === 0) {
    cartItems.style.display = 'none';
    cartEmpty.style.display = 'block';
    cartSummary.style.display = 'none';
    paypalContainer.style.display = 'none';
  } else {
    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    cartSummary.style.display = 'block';
    paypalContainer.style.display = 'block';
    
    let html = '';
    let subtotal = 0;
    
    state.cart.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1);
      subtotal += itemTotal;
      
      html += `
        <div class="cart-item-modal">
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-info">
            <div>${item.title}</div>
            <div>$${item.price.toFixed(2)} × ${item.quantity || 1}</div>
          </div>
          <div style="margin-left: auto; font-weight: bold;">
            $${itemTotal.toFixed(2)}
          </div>
        </div>
      `;
    });
    
    cartItems.innerHTML = html;
    
    const tax = subtotal * 0.085; // 8.5% tax
    const total = subtotal + tax;
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    
    // Initialize PayPal buttons
    initializePayPal(total);
  }
  
  openModal('cartModal');
}

function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    state.cart = [];
    safeSetItem('kdr_cart', state.cart);
    updateCartUI();
    showCart(); // Refresh cart display
    showNotification('Cart cleared');
  }
}

// PayPal Integration
function initializePayPal(total) {
  const paypalContainer = document.getElementById('paypal-button-container');
  if (!paypalContainer) return;
  
  // Clear previous buttons
  paypalContainer.innerHTML = '';
  
  // Initialize PayPal buttons
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Payment successful
        processOrder(details);
      });
    }
  }).render('#paypal-button-container');
}

function processOrder(details) {
  // Save order to localStorage
  const orders = safeGetItem('kdr_orders', []);
  orders.push({
    id: details.id,
    date: new Date().toISOString(),
    items: state.cart,
    total: state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
    customer: details.payer
  });
  safeSetItem('kdr_orders', orders);
  
  // Clear cart
  state.cart = [];
  safeSetItem('kdr_cart', state.cart);
  updateCartUI();
  
  // Close cart modal
  closeModal('cartModal');
  
  // Show success notification
  showNotification('Payment successful! Thank you for your order.');
}

// Modal Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

// Notification System
function showNotification(message) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Hide notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Loading System
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const progressBar = document.getElementById('loadingProgress');
  
  if (!loadingScreen || !progressBar) return;
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 20 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500);
    }
    progressBar.style.width = progress + '%';
  }, 200);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
  console.log('KornDog Records initializing...');
  
  // Start loading sequence
  hideLoadingScreen();
  
  // Setup admin access
  setupAdminAccess();
  
  // Initialize UI
  updateCartUI();
  
  // Loading failsafe
  setTimeout(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      loadingScreen.classList.add('hidden');
      console.log('Loading screen hidden by failsafe');
    }
  }, 8000);

  // Product form handler
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const title = document.getElementById('productTitle').value.trim();
      const price = parseFloat(document.getElementById('productPrice').value);
      const description = document.getElementById('productDescription').value.trim();
      const type = document.getElementById('productType').value;
      
      if (title && price > 0 && description) {
        saveProduct();
      } else {
        showNotification('Please fill in all fields correctly');
      }
    });
  }
  
  console.log('KornDog Records initialized successfully!');
});

const BASE_URL = "/api";
// Global variables
let salesChart = null;
let currentOrders = [];
let currentMenuItems = [];
let currentCategories = [];

// Utility Functions
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(element, show = true) {
    if (show) {
        element.innerHTML = '<div class="loading"></div>';
    }
}

function formatCurrency(amount) {
    return `₹ ${parseFloat(amount).toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Navigation
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections explicitly
    const allSections = document.querySelectorAll('.content-section');
    console.log('Found sections:', allSections.length);
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
        console.log('Hiding section:', section.id);
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section explicitly
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
        console.log('Showing section:', sectionId);
    } else {
        console.error('Section not found:', sectionId);
    }
    
    // Add active class to corresponding nav item
    const navItem = document.querySelector(`.nav-item[onclick="showSection('${sectionId}')"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Load data for the section
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboardSection':
            loadDashboard();
            break;
        case 'categorySection':
            loadCategories();
            break;
        case 'menuSection':
            loadMenu();
            loadCategories();
            break;
        case 'customerSection':
            loadCustomers();
            break;
        case 'orderSection':
            loadOrders();
            loadMenu(); // Load menu items for dropdown
            loadCustomers(); // Load customers for dropdown
            break;
        case 'billingSection':
            // Billing section doesn't need to load data initially
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        // Load orders for dashboard stats
        const ordersResponse = await fetch(`${BASE_URL}/order/all`);
        const orders = await ordersResponse.json();
        
        // Only consider orders that have items (billed orders)
        const billedOrders = [];
        const itemSales = {};
        
        for (const order of orders) {
            try {
                const itemsResponse = await fetch(`${BASE_URL}/order/itemsWithDetails/${order.id}`);
                const items = await itemsResponse.json();
                
                if (items.length > 0) {
                    billedOrders.push(order);
                    
                    // Track item sales for top seller
                    items.forEach(item => {
                        const itemName = item.item_name;
                        itemSales[itemName] = (itemSales[itemName] || 0) + item.quantity;
                    });
                }
            } catch (error) {
                // Skip orders that can't be billed
                continue;
            }
        }
        
        console.log('Billed orders found:', billedOrders.length);
        console.log('Item sales:', itemSales);
        
        // Calculate stats
        const totalRevenue = await calculateTotalRevenue(billedOrders);
        const todayRevenue = await calculateTodayRevenue(billedOrders);
        const totalOrders = billedOrders.length;
        const topItem = getTopSellingItem(itemSales);
        
        console.log('Total revenue:', totalRevenue);
        console.log('Today revenue:', todayRevenue);
        
        // Update dashboard - showing both today's and total revenue
        document.getElementById('todayRevenue').textContent = formatCurrency(todayRevenue);
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('ordersCount').textContent = totalOrders;
        document.getElementById('topItem').textContent = topItem || 'No data';
        
        // Load chart
        loadSalesChart(billedOrders);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

async function calculateTotalRevenue(orders) {
    let totalRevenue = 0;
    
    for (const order of orders) {
        try {
            const itemsResponse = await fetch(`${BASE_URL}/order/itemsWithDetails/${order.id}`);
            const items = await itemsResponse.json();
            
            const orderTotal = items.reduce((total, item) => total + (item.item_price * item.quantity), 0);
            totalRevenue += orderTotal;
            console.log(`Order ${order.id} total: ${orderTotal}`);
        } catch (error) {
            console.error('Error calculating revenue for order:', order.id, error);
            continue;
        }
    }
    
    return totalRevenue;
}

async function calculateTodayRevenue(orders) {
    const today = new Date().toDateString();
    let totalRevenue = 0;
    
    for (const order of orders) {
        if (new Date(order.orderDate).toDateString() === today) {
            try {
                const itemsResponse = await fetch(`${BASE_URL}/order/itemsWithDetails/${order.id}`);
                const items = await itemsResponse.json();
                
                const orderTotal = items.reduce((total, item) => total + (item.item_price * item.quantity), 0);
                totalRevenue += orderTotal;
            } catch (error) {
                continue;
            }
        }
    }
    
    return totalRevenue;
}

function getTopSellingItem(itemSales) {
    if (!itemSales || Object.keys(itemSales).length === 0) {
        return 'No data';
    }
    
    return Object.keys(itemSales).reduce((a, b) => itemSales[a] > itemSales[b] ? a : b);
}

async function loadSalesChart(orders) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Prepare data for last 7 days
    const last7Days = [];
    const salesData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        last7Days.push(date.toLocaleDateString('en-IN', { weekday: 'short' }));
        
        // Calculate revenue for this day
        let dayRevenue = 0;
        const dayOrders = orders.filter(order => new Date(order.orderDate).toDateString() === dateString);
        
        for (const order of dayOrders) {
            try {
                const itemsResponse = await fetch(`${BASE_URL}/order/itemsWithDetails/${order.id}`);
                const items = await itemsResponse.json();
                
                const orderTotal = items.reduce((total, item) => total + (item.item_price * item.quantity), 0);
                dayRevenue += orderTotal;
            } catch (error) {
                continue;
            }
        }
        
        salesData.push(dayRevenue);
    }
    
    if (salesChart) {
        salesChart.destroy();
    }
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Sales (₹)',
                data: salesData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

// Category Management Functions
async function loadCategories() {
    try {
        const response = await fetch(`${BASE_URL}/category/all`);
        const categories = await response.json();
        currentCategories = categories;
        
        displayCategories(categories);
        updateCategoryDropdown(categories);
        
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

function displayCategories(categories) {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="text-center">No categories found</p>';
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="category-card">
            <div>
                <h4>${category.name}</h4>
                <small>ID: ${category.id}</small>
            </div>
            <button class="btn btn-danger" onclick="deleteCategory(${category.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function updateCategoryDropdown(categories) {
    const dropdown = document.getElementById('categoryId');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Select Category</option>' +
        categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
}

async function addCategory() {
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showToast('Please enter category name', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/category/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        if (response.ok) {
            showToast('Category added successfully', 'success');
            nameInput.value = '';
            loadCategories();
        } else {
            throw new Error('Failed to add category');
        }
        
    } catch (error) {
        console.error('Error adding category:', error);
        showToast('Failed to add category', 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/category/delete/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Category deleted successfully', 'success');
            loadCategories();
        } else {
            throw new Error('Failed to delete category');
        }
        
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Failed to delete category', 'error');
    }
}

// Menu Management Functions
async function loadMenu() {
    try {
        const response = await fetch(`${BASE_URL}/menu/all`);
        const menuItems = await response.json();
        currentMenuItems = menuItems;
        
        displayMenuItems(menuItems);
        updateMenuDropdown(menuItems);
        
    } catch (error) {
        console.error('Error loading menu:', error);
        showToast('Failed to load menu items', 'error');
    }
}

function displayMenuItems(menuItems) {
    const container = document.getElementById('menuCards');
    
    if (menuItems.length === 0) {
        container.innerHTML = '<p class="text-center">No menu items found</p>';
        return;
    }
    
    container.innerHTML = menuItems.map(item => {
        const category = currentCategories.find(cat => cat.id === item.categoryId);
        return `
            <div class="menu-card">
                <div class="menu-card-header">
                    <h4>${item.name}</h4>
                    <small>${category ? category.name : 'Uncategorized'}</small>
                </div>
                <div class="menu-card-body">
                    <div class="menu-price">${formatCurrency(item.price)}</div>
                    <div class="menu-actions">
                        <button class="btn btn-info" onclick="updateMenuItemPrice(${item.id})">
                            <i class="fas fa-edit"></i> Update Price
                        </button>
                        <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function addItem() {
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const categoryInput = document.getElementById('categoryId');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const categoryId = parseInt(categoryInput.value);
    
    if (!name || !price || !categoryId) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/menu/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                price,
                categoryId
            })
        });
        
        if (response.ok) {
            showToast('Menu item added successfully', 'success');
            nameInput.value = '';
            priceInput.value = '';
            categoryInput.value = '';
            loadMenu();
        } else {
            throw new Error('Failed to add menu item');
        }
        
    } catch (error) {
        console.error('Error adding menu item:', error);
        showToast('Failed to add menu item', 'error');
    }
}

async function searchMenuItem() {
    const searchInput = document.getElementById('searchItemName');
    const name = searchInput.value.trim();
    const resultContainer = document.getElementById('searchResult');
    
    if (!name) {
        resultContainer.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/menu/search/${name}`);
        
        if (response.ok) {
            const item = await response.json();
            resultContainer.innerHTML = `
                <div class="search-result">
                    <h4>Search Result:</h4>
                    <p><strong>${item.name}</strong> - ${formatCurrency(item.price)}</p>
                    <small>Category ID: ${item.categoryId}</small>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `
                <div class="search-result">
                    <p>No item found with name "${name}"</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error searching menu item:', error);
        resultContainer.innerHTML = `
            <div class="search-result">
                <p>Error searching for item</p>
            </div>
        `;
    }
}

async function updateMenuItemPrice(itemId) {
    const newPrice = prompt('Enter new price:');
    
    if (!newPrice || isNaN(newPrice)) {
        showToast('Invalid price', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/menu/updatePrice`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: itemId,
                price: parseFloat(newPrice)
            })
        });
        
        if (response.ok) {
            showToast('Price updated successfully', 'success');
            loadMenu();
        } else {
            throw new Error('Failed to update price');
        }
        
    } catch (error) {
        console.error('Error updating price:', error);
        showToast('Failed to update price', 'error');
    }
}

async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/menu/delete/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Menu item deleted successfully', 'success');
            loadMenu();
        } else {
            throw new Error('Failed to delete menu item');
        }
        
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showToast('Failed to delete menu item', 'error');
    }
}

async function sortMenu() {
    try {
        const response = await fetch(`${BASE_URL}/menu/sort`);
        const sortedItems = await response.json();
        
        displayMenuItems(sortedItems);
        showToast('Menu sorted by price', 'success');
        
    } catch (error) {
        console.error('Error sorting menu:', error);
        showToast('Failed to sort menu', 'error');
    }
}

function updateCustomerDropdown(customers) {
    const dropdown = document.getElementById('orderCustomerId');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Select Customer</option>' +
        customers.map(customer => 
            `<option value="${customer.id}">${customer.name}</option>`
        ).join('');
}

function updateMenuDropdown(menuItems) {
    const dropdown = document.getElementById('menuItemName');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Select Menu Item</option>' +
        menuItems.map(item => 
            `<option value="${item.id}">${item.name} - ${formatCurrency(item.price)}</option>`
        ).join('');
}

// Customer Management Functions
async function loadCustomers() {
    try {
        const response = await fetch(`${BASE_URL}/customer/all`);
        const customers = await response.json();
        
        displayCustomers(customers);
        updateCustomerDropdown(customers);
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Failed to load customers', 'error');
    }
}

function displayCustomers(customers) {
    const container = document.getElementById('customersList');
    
    if (customers.length === 0) {
        container.innerHTML = '<p class="text-center">No customers found</p>';
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="customer-card">
            <div class="customer-info">
                <div class="customer-avatar">${customer.name.charAt(0).toUpperCase()}</div>
                <div>
                    <h4>${customer.name}</h4>
                    <p><i class="fas fa-phone"></i> ${customer.phone}</p>
                    <small>ID: ${customer.id}</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function addCustomer() {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    if (!name || !phone) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/customer/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone })
        });
        
        if (response.ok) {
            showToast('Customer added successfully', 'success');
            nameInput.value = '';
            phoneInput.value = '';
            loadCustomers();
        } else {
            throw new Error('Failed to add customer');
        }
        
    } catch (error) {
        console.error('Error adding customer:', error);
        showToast('Failed to add customer', 'error');
    }
}

async function searchCustomer() {
    const idInput = document.getElementById('searchCustomerId');
    const resultContainer = document.getElementById('customerSearchResult');
    const customerId = parseInt(idInput.value);
    
    if (!customerId) {
        resultContainer.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/customer/search/${customerId}`);
        
        if (response.ok) {
            const customer = await response.json();
            resultContainer.innerHTML = `
                <div class="search-result">
                    <h4>Customer Found:</h4>
                    <p><strong>Name:</strong> ${customer.name}</p>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>ID:</strong> ${customer.id}</p>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `
                <div class="search-result">
                    <p>No customer found with ID ${customerId}</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error searching customer:', error);
        resultContainer.innerHTML = `
            <div class="search-result">
                <p>Error searching for customer</p>
            </div>
        `;
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${BASE_URL}/order/all`);
        const orders = await response.json();
        currentOrders = orders;
        
        displayOrders(orders);
        updateOrderDropdown(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="text-center">No orders found</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <h4>Order #${order.id}</h4>
            <p><strong>Customer ID:</strong> ${order.customerId}</p>
            <p><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
            <div class="mt-2">
                <button class="btn btn-info" onclick="viewOrderItems(${order.id})">
                    <i class="fas fa-eye"></i> View Items
                </button>
                <button class="btn btn-success" onclick="generateBillForOrder(${order.id})">
                    <i class="fas fa-receipt"></i> Generate Bill
                </button>
            </div>
        </div>
    `).join('');
}

function updateOrderDropdown(orders) {
    const dropdowns = ['orderItemId', 'billingOrderId', 'viewOrderId'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Select Order</option>' +
            orders.map(order => 
                `<option value="${order.id}">Order #${order.id} - ${formatDate(order.orderDate)}</option>`
            ).join('');
    });
}

async function createOrder() {
    const customerSelect = document.getElementById('orderCustomerId');
    const resultContainer = document.getElementById('orderCreationResult');
    const customerId = parseInt(customerSelect.value);
    
    if (!customerId) {
        showToast('Please select a customer', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/order/create/${customerId}`, { method: 'POST' });
        if (response.ok) {
            const orderId = await response.json();
            resultContainer.innerHTML = `<div class="order-result success"><i class="fas fa-check-circle"></i>Order created successfully! Order ID: ${orderId}</div>`;
            showToast('Order created successfully', 'success');
            customerSelect.value = '';
            loadOrders();
        } else {
            throw new Error('Failed to create order');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        resultContainer.innerHTML = `<div class="order-result error"><i class="fas fa-exclamation-circle"></i>Failed to create order</div>`;
        showToast('Failed to create order', 'error');
    }
}

async function addItemToOrder() {
    const orderIdInput = document.getElementById('orderItemId');
    const menuItemSelect = document.getElementById('menuItemName');
    const quantityInput = document.getElementById('itemQuantity');
    const resultContainer = document.getElementById('orderItemResult');
    
    const orderId = parseInt(orderIdInput.value);
    const menuId = parseInt(menuItemSelect.value);
    const quantity = parseInt(quantityInput.value);
    
    if (!orderId || !menuId || !quantity) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/order/addItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId,
                menuId,
                quantity
            })
        });
        
        if (response.ok) {
            resultContainer.innerHTML = `
                <div class="order-result success">
                    <i class="fas fa-check-circle"></i>
                    Item added to order successfully!
                </div>
            `;
            showToast('Item added to order', 'success');
            menuItemSelect.value = '';
            quantityInput.value = '1';
        } else {
            throw new Error('Failed to add item to order');
        }
        
    } catch (error) {
        console.error('Error adding item to order:', error);
        resultContainer.innerHTML = `
            <div class="order-result error">
                <i class="fas fa-exclamation-circle"></i>
                Failed to add item to order
            </div>
        `;
        showToast('Failed to add item to order', 'error');
    }
}

async function viewOrderItems(orderId) {
    const container = document.getElementById('orderItemsList');
    
    if (!orderId) {
        orderId = parseInt(document.getElementById('viewOrderId').value);
    }
    
    if (!orderId) {
        showToast('Please select an order', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/order/itemsWithDetails/${orderId}`);
        
        if (response.ok) {
            const items = await response.json();
            
            if (items.length === 0) {
                container.innerHTML = '<p class="text-center">No items found in this order</p>';
                return;
            }
            
            container.innerHTML = `
                <h4>Order #${orderId} Items:</h4>
                ${items.map(item => `
                    <div class="order-item">
                        <span>${item.item_name} × ${item.quantity}</span>
                        <span>${formatCurrency(item.item_price * item.quantity)}</span>
                    </div>
                `).join('')}
            `;
        } else {
            container.innerHTML = '<p class="text-center">No items found in this order</p>';
        }
        
    } catch (error) {
        console.error('Error viewing order items:', error);
        container.innerHTML = '<p class="text-center">Error loading order items</p>';
    }
}

// Billing Functions
async function generateBill() {
    const orderSelect = document.getElementById('billingOrderId');
    const orderId = parseInt(orderSelect.value);
    
    if (!orderId) {
        showToast('Please select an order', 'warning');
        return;
    }
    
    await generateBillForOrder(orderId);
}

async function generateBillForOrder(orderId) {
    const receiptContainer = document.getElementById('receipt');
    
    try {
        // Get order items with details
        const itemsResponse = await fetch(`${BASE_URL}/order/itemsWithDetails/${orderId}`);
        const items = await itemsResponse.json();
        
        if (items.length === 0) {
            showToast('No items found in this order', 'warning');
            return;
        }
        
        // Calculate totals
        const subtotal = items.reduce((total, item) => total + (item.item_price * item.quantity), 0);
        const gst = subtotal * 0.05; // 5% GST
        const total = subtotal + gst;
        
        // Generate receipt HTML
        receiptContainer.innerHTML = `
            <div class="receipt-header">
                <h3>Restaurant Receipt</h3>
                <p>Order ID: ${orderId}</p>
                <p>Date: ${formatDate(new Date())}</p>
            </div>
            
            <div class="receipt-body">
                ${items.map(item => `
                    <div class="receipt-item">
                        <span>${item.item_name} × ${item.quantity}</span>
                        <span>${formatCurrency(item.item_price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="receipt-total">
                <div class="receipt-item">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="receipt-item">
                    <span>GST (5%):</span>
                    <span>${formatCurrency(gst)}</span>
                </div>
                <div class="receipt-item">
                    <span><strong>Total:</strong></span>
                    <span><strong>${formatCurrency(total)}</strong></span>
                </div>
            </div>
            
            <div class="text-center mt-3">
                <p>Thank you for visiting!</p>
                <button class="btn btn-primary" onclick="printReceipt()">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
            </div>
        `;
        
        // Navigate to billing section and scroll to receipt
        showSection('billingSection');
        setTimeout(() => {
            receiptContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
    } catch (error) {
        console.error('Error generating bill:', error);
        showToast('Failed to generate bill', 'error');
    }
}

function printReceipt() {
    const receiptContent = document.getElementById('receipt').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Restaurant Receipt</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; }
                .receipt-header { text-align: center; margin-bottom: 20px; }
                .receipt-item { display: flex; justify-content: space-between; margin: 5px 0; }
                .receipt-total { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
                .text-center { text-align: center; }
            </style>
        </head>
        <body>
            ${receiptContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Refresh Functions
async function refreshAllData() {
    showToast('Refreshing all data...', 'info');
    
    try {
        await Promise.all([
            loadDashboard(),
            loadCategories(),
            loadMenu(),
            loadCustomers(),
            loadOrders()
        ]);
        
        showToast('All data refreshed successfully', 'success');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showToast('Failed to refresh some data', 'warning');
    }
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded successfully!');
    
    // Load initial data
    loadDashboard();
    
    // Add enter key support for forms
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                const form = activeElement.closest('.form-group, .form-row');
                const button = form?.querySelector('button');
                if (button) {
                    button.click();
                }
            }
        }
    });
});

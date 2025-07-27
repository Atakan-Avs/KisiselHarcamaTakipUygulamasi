// --- DOM Elements ---
const form = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const tableBody = document.querySelector('#expense-table tbody');
const totalAmountSpan = document.getElementById('total-amount');
const formError = document.getElementById('form-error');

// Custom dropdowns
const categoryDropdown = document.getElementById('category-dropdown');
const categoryToggle = document.getElementById('category-toggle');
const categoryMenu = document.getElementById('category-menu');
let selectedCategory = '';

const filterDropdown = document.getElementById('filter-dropdown');
const filterToggle = document.getElementById('filter-toggle');
const filterMenu = document.getElementById('filter-menu');
let selectedFilter = 'all';

// --- LocalStorage Key ---
const STORAGE_KEY = 'expenses';

// --- DARK MODE ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
const DARK_MODE_KEY = 'darkMode';

// --- Load Expenses ---
let expenses = loadExpenses();
renderExpenses();

// --- Custom Dropdown Functions ---
function setupDropdown(dropdown, toggle, menu, onSelect) {
  // Toggle open/close
  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.classList.toggle('open');
    toggle.classList.toggle('active');
  });
  // Selection
  menu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function(e) {
      menu.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
      li.classList.add('selected');
      toggle.textContent = li.textContent;
      onSelect(li.dataset.value);
      dropdown.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.dropdown-toggle').forEach(t => t.classList.remove('active'));
}

document.addEventListener('click', closeAllDropdowns);

// Category dropdown
setupDropdown(
  categoryDropdown,
  categoryToggle,
  categoryMenu,
  function(value) { selectedCategory = value; }
);

// Filter dropdown
setupDropdown(
  filterDropdown,
  filterToggle,
  filterMenu,
  function(value) { selectedFilter = value; renderExpenses(); }
);

// --- Form Submit ---
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const description = descriptionInput.value.trim();
  const category = selectedCategory;
  const amount = parseFloat(amountInput.value);
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validation
  if (!description || !category || isNaN(amount) || amount <= 0) {
    showError('Please fill in all fields correctly. Amount must be positive.');
    return;
  }

  hideError();
  const expense = {
    id: Date.now(),
    description,
    category,
    amount,
    date: new Date().toLocaleString('en-US') // changed locale
  };
  expenses.push(expense);
  saveExpenses();
  renderExpenses();
  form.reset();
  categoryToggle.textContent = 'Category';
  selectedCategory = '';

  // --- Success animation ---
  submitBtn.classList.add('success');
  submitBtn.textContent = 'Added!';
  setTimeout(() => {
    submitBtn.classList.remove('success');
    submitBtn.textContent = 'Add';
  }, 900);
});

// --- Delete Event ---
tableBody.addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.dataset.id);
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderExpenses();
  }
});

// --- Functions ---
function renderExpenses() {
  const filter = selectedFilter;
  let filtered = expenses;
  if (filter !== 'all') {
    filtered = expenses.filter(exp => exp.category === filter);
  }
  tableBody.innerHTML = '';
  let total = 0;
  filtered.forEach(exp => {
    total += exp.amount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.description}</td>
      <td>${exp.category}</td>
      <td>${exp.amount.toFixed(2)} ₺</td>
      <td><button class="delete-btn" data-id="${exp.id}">Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });
  totalAmountSpan.textContent = total.toFixed(2) + ' ₺';
}

function showError(msg) {
  formError.textContent = msg;
  formError.style.display = 'block';
}

function hideError() {
  formError.textContent = '';
  formError.style.display = 'none';
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// --- DARK MODE ---
function setDarkMode(on) {
  if (on) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '🌗';
  } else {
    document.body.classList.remove('dark-mode');
    darkModeToggle.textContent = '🌑';
  }
  localStorage.setItem(DARK_MODE_KEY, on ? '1' : '0');
}

darkModeToggle.addEventListener('click', function() {
  const isDark = document.body.classList.contains('dark-mode');
  setDarkMode(!isDark);
});

// Load dark mode on page load
(function() {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  setDarkMode(saved === '1');
})();


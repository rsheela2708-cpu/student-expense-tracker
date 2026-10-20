const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const filterInput = document.getElementById("filterCategory");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");
const totalSpent = document.getElementById("totalSpent");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");

const STORAGE_KEY = "studentExpenses";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

let expenses = [];

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  if (
    Array.isArray(saved) &&
    saved.every(e =>
      e &&
      typeof e.id === "string" &&
      typeof e.title === "string" &&
      typeof e.amount === "number" &&
      Number.isFinite(e.amount) &&
      e.amount > 0 &&
      typeof e.category === "string" &&
      typeof e.date === "string"
    )
  ) {
    expenses = saved;
  }
} catch (error) {
  console.error("Unable to load expenses:", error);
}

function saveExpenses() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(expenses)
    );
    return true;
  } catch (error) {
    alert("Unable to save expenses in this browser.");
    return false;
  }
}

function setToday() {
  const now = new Date();

  dateInput.value = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);
}

function updateSummary() {
  const total = expenses.reduce(
    (sum, e) => sum + e.amount, 0
  );

  const highest = expenses.reduce(
    (max, e) => Math.max(max, e.amount), 0
  );

  totalSpent.textContent = money.format(total);
  expenseCount.textContent = expenses.length;
  highestExpense.textContent = money.format(highest);
}

function renderExpenses() {
  expenseList.replaceChildren();

  const category = filterInput.value;

  const filtered = expenses
    .filter(e => category === "All" || e.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));

  emptyMessage.hidden = filtered.length > 0;
  emptyMessage.textContent = expenses.length === 0
    ? "No expenses yet. Add your first expense! 🎉"
    : "No expenses in this category.";

  filtered.forEach(e => {
    const row = document.createElement("tr");

    const values = [e.title, e.category, e.date, money.format(e.amount)];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (index === 3) {
        cell.className = "amount";
      }

      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const button = document.createElement("button");

    button.textContent = "Delete";
    button.className = "delete-button";
    button.type = "button";

    button.addEventListener("click", () => {
      deleteExpense(e.id);
    });

    actionCell.appendChild(button);
    row.appendChild(actionCell);
    expenseList.appendChild(row);
  });

  updateSummary();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (
    !title ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 100000000 ||
    !date ||
    !categoryInput.validity.valid
  ) {
    alert("Please enter valid expense details.");
    return;
  }

  const expense = {
    id: crypto.randomUUID(),
    title,
    amount,
    category,
    date
  };

  expenses.push(expense);

  if (!saveExpenses()) {
    expenses.pop();
    return;
  }

  form.reset();
  setToday();
  filterInput.value = "All";
  renderExpenses();
});

function deleteExpense(id) {
  const previous = expenses;
  expenses = expenses.filter(e => e.id !== id);

  if (!saveExpenses()) {
    expenses = previous;
    return;
  }

  renderExpenses();
}

filterInput.addEventListener("change", renderExpenses);

setToday();
renderExpenses();


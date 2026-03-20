import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, setDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";
import { defaultRooms, defaultFurniture, categories } from "./data.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── STATE ──
let state = {
  currentUser: "Priya",
  currentScreen: "dashboard",
  rooms: [],
  furniture: [],
  items: [],
  editingItemId: null,
  deleteItemId: null,
  filterRoom: "all",
  filterFurniture: "all",
  filterCategory: "all",
  filterPerson: "all",
  searchQuery: "",
  expandedRooms: {}
};

// ── INIT ──
document.addEventListener("DOMContentLoaded", async () => {
  await initFirestore();
  setupListeners();
  renderAll();
  goTo("dashboard");
});

async function initFirestore() {
  const roomsSnap = await getDocs(collection(db, "rooms"));
  if (roomsSnap.empty) {
    for (const r of defaultRooms) await setDoc(doc(db, "rooms", r.id), r);
    for (const f of defaultFurniture) await setDoc(doc(db, "furniture", f.id), f);
  }
  onSnapshot(collection(db, "rooms"), snap => {
    state.rooms = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order);
    renderAll();
  });
  onSnapshot(collection(db, "furniture"), snap => {
    state.furniture = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order);
    renderAll();
  });
  onSnapshot(query(collection(db, "items"), orderBy("dateAdded", "desc")), snap => {
    state.items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAll();
  });
}

// ── NAVIGATION ──
function goTo(screen, data = {}) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(`screen-${screen}`)?.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.querySelector(`[data-nav="${screen}"]`)?.classList.add("active");
  state.currentScreen = screen;
  if (data.itemId) renderDetail(data.itemId);
  if (screen === "add") renderAddForm(data.editId || null);
  if (screen === "inventory") renderInventory();
  if (screen === "dashboard") renderDashboard();
  if (screen === "expiry") renderExpiry();
  if (screen === "myhome") renderMyHome();
  if (screen === "export") renderExport();
  window.scrollTo(0, 0);
}
window.goTo = goTo;

// ── WHO TOGGLE ──
function setUser(name) {
  state.currentUser = name;
  document.querySelectorAll(".who-btn").forEach(b => b.classList.toggle("active", b.dataset.who === name));
  document.querySelectorAll(".who-opt").forEach(b => b.classList.toggle("active", b.dataset.who === name));
}
window.setUser = setUser;

// ── HELPERS ──
function getRoomName(id) { return state.rooms.find(r => r.id === id)?.name || id; }
function getFurnitureName(id) { return state.furniture.find(f => f.id === id)?.name || id; }
function getCategoryName(id) { return categories.find(c => c.id === id)?.name || id; }
function getRoomIcon(id) { return state.rooms.find(r => r.id === id)?.icon || "🏠"; }

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { cls: "exp-none", label: "" };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  const days = Math.round((exp - today) / 86400000);
  if (days < 0) return { cls: "exp-red", label: "Expired", days };
  if (days <= 30) return { cls: "exp-amber", label: `${days}d left`, days };
  if (days <= 90) return { cls: "exp-green", label: `${days}d left`, days };
  return { cls: "exp-none", label: "", days };
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function formatPrice(p) { return p ? `€${parseFloat(p).toFixed(2)}` : ""; }
function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

// ── DASHBOARD ──
function renderDashboard() {
  const total = state.items.length;
  const expiring = state.items.filter(i => { const s = getExpiryStatus(i.expiryDate); return s.cls === "exp-red" || s.cls === "exp-amber"; }).length;
  const totalVal = state.items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
  const byPriya = state.items.filter(i => i.addedBy === "Priya").length;
  const byVivek = state.items.filter(i => i.addedBy === "Vivek").length;

  document.getElementById("dash-total").textContent = total;
  document.getElementById("dash-expiring").textContent = expiring;
  document.getElementById("dash-value").textContent = `€${totalVal.toFixed(0)}`;
  document.getElementById("dash-priya").textContent = byPriya;
  document.getElementById("dash-vivek").textContent = byVivek;
  document.getElementById("qa-inv-sub").textContent = `${total} items across your home`;
  document.getElementById("qa-exp-sub").textContent = expiring > 0 ? `${expiring} items need attention` : "All good!";
}

// ── INVENTORY ──
function renderInventory() {
  renderRoomFilters();
  renderFurnitureFilters();
  renderCategoryFilters();
  renderItems();
}

function renderRoomFilters() {
  const el = document.getElementById("filter-rooms");
  el.innerHTML = `<button class="chip ${state.filterRoom === "all" ? "active" : ""}" onclick="setFilter('room','all')">All rooms</button>`;
  state.rooms.forEach(r => {
    el.innerHTML += `<button class="chip ${state.filterRoom === r.id ? "active" : ""}" onclick="setFilter('room','${r.id}')">${r.name}</button>`;
  });
}

function renderFurnitureFilters() {
  const el = document.getElementById("filter-furniture");
  const relevantFurniture = state.filterRoom === "all" ? [] : state.furniture.filter(f => f.roomId === state.filterRoom);
  if (relevantFurniture.length === 0) { el.innerHTML = ""; return; }
  el.innerHTML = `<button class="chip ${state.filterFurniture === "all" ? "active" : ""}" onclick="setFilter('furniture','all')">All locations</button>`;
  relevantFurniture.forEach(f => {
    el.innerHTML += `<button class="chip ${state.filterFurniture === f.id ? "active" : ""}" onclick="setFilter('furniture','${f.id}')">${f.name}</button>`;
  });
}

function renderCategoryFilters() {
  const el = document.getElementById("filter-categories");
  el.innerHTML = `<button class="chip ${state.filterCategory === "all" ? "active" : ""}" onclick="setFilter('category','all')">All categories</button>`;
  categories.forEach(c => {
    el.innerHTML += `<button class="chip ${state.filterCategory === c.id ? "active" : ""}" onclick="setFilter('category','${c.id}')">${c.name}</button>`;
  });
}

function setFilter(type, value) {
  if (type === "room") { state.filterRoom = value; state.filterFurniture = "all"; }
  if (type === "furniture") state.filterFurniture = value;
  if (type === "category") state.filterCategory = value;
  renderInventory();
}
window.setFilter = setFilter;

function getFilteredItems() {
  let items = [...state.items];
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q));
  }
  if (state.filterRoom !== "all") items = items.filter(i => i.roomId === state.filterRoom);
  if (state.filterFurniture !== "all") items = items.filter(i => i.furnitureId === state.filterFurniture);
  if (state.filterCategory !== "all") items = items.filter(i => i.categoryId === state.filterCategory);
  if (state.filterPerson !== "all") items = items.filter(i => i.addedBy === state.filterPerson);
  return items;
}

function renderItems() {
  const items = getFilteredItems();
  const el = document.getElementById("items-list");
  document.getElementById("results-count").textContent = `${items.length} item${items.length !== 1 ? "s" : ""} found`;
  if (items.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">No items found</div><div class="empty-text">Try changing your filters or add a new item.</div></div>`;
    return;
  }
  el.innerHTML = items.map(item => {
    const exp = getExpiryStatus(item.expiryDate);
    const fName = getFurnitureName(item.furnitureId);
    const rName = getRoomName(item.roomId);
    return `<div class="item-card" onclick="goTo('detail', {itemId: '${item.id}'})">
      <div class="item-row1">
        <span class="item-name">${item.name}</span>
        <span class="item-qty">×${item.quantity || 1}</span>
      </div>
      <div class="item-tags">
        <span class="tag tag-room">${rName}</span>
        <span class="tag tag-cat">${item.subcategory || getCategoryName(item.categoryId)}</span>
      </div>
      <div class="item-footer">
        <span class="item-who">${item.addedBy}</span>
        ${item.price ? `<span class="item-price">${formatPrice(item.price)}</span>` : ""}
        ${exp.cls !== "exp-none" ? `<span class="exp-badge ${exp.cls}">${exp.label}</span>` : ""}
      </div>
    </div>`;
  }).join("");
}
window.renderItems = renderItems;

// ── SEARCH ──
function handleSearch(val) {
  state.searchQuery = val;
  renderItems();
}
window.handleSearch = handleSearch;

// ── PERSON FILTER ──
function setPersonFilter(val) {
  state.filterPerson = val;
  document.querySelectorAll(".person-chip").forEach(c => c.classList.toggle("active", c.dataset.person === val));
  renderItems();
}
window.setPersonFilter = setPersonFilter;

// ── ADD / EDIT FORM ──
function renderAddForm(editId = null) {
  state.editingItemId = editId;
  const item = editId ? state.items.find(i => i.id === editId) : null;
  document.getElementById("form-title").textContent = editId ? "Edit item" : "Add item";
  document.getElementById("form-name").value = item?.name || "";
  document.getElementById("form-quantity").value = item?.quantity || 1;
  document.getElementById("form-price").value = item?.price || "";
  document.getElementById("form-expiry").value = item?.expiryDate || "";
  document.getElementById("form-purchased").value = item?.datePurchased || "";
  document.getElementById("form-notes").value = item?.notes || "";
  populateRoomSelect(item?.roomId);
  populateFurnitureSelect(item?.roomId, item?.furnitureId);
  populateCategorySelect(item?.categoryId, item?.subcategory);
  const user = item?.addedBy || state.currentUser;
  document.querySelectorAll(".who-opt").forEach(b => b.classList.toggle("active", b.dataset.who === user));
  toggleExpiryField(item?.categoryId);
}

function populateRoomSelect(selectedId) {
  const el = document.getElementById("form-room");
  el.innerHTML = `<option value="">Select room...</option>`;
  state.rooms.forEach(r => {
    el.innerHTML += `<option value="${r.id}" ${selectedId === r.id ? "selected" : ""}>${r.icon} ${r.name}</option>`;
  });
}

function populateFurnitureSelect(roomId, selectedId) {
  const el = document.getElementById("form-furniture");
  const items = roomId ? state.furniture.filter(f => f.roomId === roomId) : [];
  el.innerHTML = `<option value="">Select location...</option>`;
  items.forEach(f => {
    el.innerHTML += `<option value="${f.id}" ${selectedId === f.id ? "selected" : ""}>${f.name}</option>`;
  });
}

function populateCategorySelect(selectedCatId, selectedSub) {
  const el = document.getElementById("form-category");
  el.innerHTML = `<option value="">Select category...</option>`;
  categories.forEach(c => {
    el.innerHTML += `<option value="${c.id}" ${selectedCatId === c.id ? "selected" : ""}>${c.icon} ${c.name}</option>`;
  });
  populateSubcategorySelect(selectedCatId, selectedSub);
}

function populateSubcategorySelect(catId, selectedSub) {
  const el = document.getElementById("form-subcategory");
  const cat = categories.find(c => c.id === catId);
  if (!cat) { el.innerHTML = `<option value="">Select subcategory...</option>`; return; }
  el.innerHTML = `<option value="">Select subcategory...</option>`;
  cat.subcategories.forEach(s => {
    el.innerHTML += `<option value="${s}" ${selectedSub === s ? "selected" : ""}>${s}</option>`;
  });
}

function onRoomChange(val) {
  populateFurnitureSelect(val, null);
}
window.onRoomChange = onRoomChange;

function onCategoryChange(val) {
  populateSubcategorySelect(val, null);
  toggleExpiryField(val);
}
window.onCategoryChange = onCategoryChange;

function toggleExpiryField(catId) {
  const expiryCategories = ["medicine", "food", "beauty", "cleaning"];
  const show = expiryCategories.includes(catId);
  document.getElementById("expiry-field").classList.toggle("hidden", !show);
}

async function saveItem() {
  const name = document.getElementById("form-name").value.trim();
  const roomId = document.getElementById("form-room").value;
  const furnitureId = document.getElementById("form-furniture").value;
  const categoryId = document.getElementById("form-category").value;
  const subcategory = document.getElementById("form-subcategory").value;

  if (!name || !roomId || !furnitureId || !categoryId) {
    showToast("Please fill in the required fields");
    return;
  }

  const addedBy = document.querySelector(".who-opt.active")?.dataset.who || state.currentUser;

  const data = {
    name,
    roomId,
    furnitureId,
    categoryId,
    subcategory: subcategory || null,
    quantity: parseInt(document.getElementById("form-quantity").value) || 1,
    price: document.getElementById("form-price").value || null,
    expiryDate: document.getElementById("form-expiry").value || null,
    datePurchased: document.getElementById("form-purchased").value || null,
    notes: document.getElementById("form-notes").value.trim() || null,
    addedBy,
  };

  const btn = document.getElementById("btn-save");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    if (state.editingItemId) {
      await updateDoc(doc(db, "items", state.editingItemId), data);
      showToast("Item updated");
    } else {
      data.dateAdded = serverTimestamp();
      await addDoc(collection(db, "items"), data);
      showToast("Item added");
    }
    goTo("inventory");
  } catch (e) {
    showToast("Error saving. Please try again.");
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.textContent = "Save item";
  }
}
window.saveItem = saveItem;

// ── DETAIL ──
function renderDetail(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  state.deleteItemId = itemId;
  const exp = getExpiryStatus(item.expiryDate);
  document.getElementById("detail-name").textContent = item.name;
  document.getElementById("detail-location").textContent = `${getRoomIcon(item.roomId)} ${getRoomName(item.roomId)} → ${getFurnitureName(item.furnitureId)}`;
  document.getElementById("detail-category").textContent = getCategoryName(item.categoryId);
  document.getElementById("detail-subcategory").textContent = item.subcategory || "—";
  document.getElementById("detail-quantity").textContent = item.quantity || 1;
  document.getElementById("detail-price").textContent = formatPrice(item.price) || "—";
  document.getElementById("detail-addedby").textContent = item.addedBy;
  document.getElementById("detail-dateadded").textContent = formatDate(item.dateAdded) || "—";
  document.getElementById("detail-purchased").textContent = item.datePurchased ? new Date(item.datePurchased).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const expEl = document.getElementById("detail-expiry");
  if (item.expiryDate) {
    expEl.textContent = `${new Date(item.expiryDate).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}${exp.label ? " · " + exp.label : ""}`;
    expEl.className = `exp-badge ${exp.cls}`;
    expEl.style.display = "inline-block";
  } else {
    expEl.style.display = "none";
  }
  const notesEl = document.getElementById("detail-notes-section");
  if (item.notes) {
    notesEl.classList.remove("hidden");
    document.getElementById("detail-notes-val").textContent = item.notes;
  } else {
    notesEl.classList.add("hidden");
  }
  document.getElementById("btn-edit-item").onclick = () => goTo("add", { editId: itemId });
}

async function confirmDelete() {
  if (!state.deleteItemId) return;
  try {
    await deleteDoc(doc(db, "items", state.deleteItemId));
    closeModal("modal-delete");
    showToast("Item deleted");
    goTo("inventory");
  } catch (e) {
    showToast("Error deleting item");
  }
}
window.confirmDelete = confirmDelete;

// ── EXPIRY SCREEN ──
function renderExpiry() {
  const expired = state.items.filter(i => getExpiryStatus(i.expiryDate).cls === "exp-red");
  const soon = state.items.filter(i => getExpiryStatus(i.expiryDate).cls === "exp-amber");
  const upcoming = state.items.filter(i => getExpiryStatus(i.expiryDate).cls === "exp-green");

  const renderGroup = (items, title, cls, textColor) => {
    if (items.length === 0) return "";
    return `<div class="expiry-group">
      <div class="expiry-group-title ${cls}" style="color:${textColor}">${title} (${items.length})</div>
      ${items.map(item => {
        const exp = getExpiryStatus(item.expiryDate);
        return `<div class="expiry-item" onclick="goTo('detail', {itemId: '${item.id}'})">
          <div class="ei-left">
            <div class="ei-name">${item.name}</div>
            <div class="ei-loc">${getRoomName(item.roomId)} → ${getFurnitureName(item.furnitureId)}</div>
          </div>
          <div class="ei-days" style="color:${textColor}">${exp.label}</div>
        </div>`;
      }).join("")}
    </div>`;
  };

  const el = document.getElementById("expiry-content");
  const html = renderGroup(expired, "Already expired", "exp-red", "var(--red)") +
    renderGroup(soon, "Expiring within 30 days", "exp-amber", "var(--amber)") +
    renderGroup(upcoming, "Expiring within 90 days", "exp-green", "var(--green)");

  el.innerHTML = html || `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">All clear!</div><div class="empty-text">Nothing expiring soon. You're on top of it.</div></div>`;
}

// ── MY HOME ──
function renderMyHome() {
  const el = document.getElementById("home-tree");
  el.innerHTML = state.rooms.map(room => {
    const roomFurniture = state.furniture.filter(f => f.roomId === room.id);
    const roomItems = state.items.filter(i => i.roomId === room.id).length;
    const isOpen = state.expandedRooms[room.id] !== false;
    return `<div class="tree-room">
      <div class="tree-room-header" onclick="toggleRoom('${room.id}')">
        <div class="tree-room-left">
          <span class="tree-room-icon">${room.icon}</span>
          <span class="tree-room-name">${room.name}</span>
        </div>
        <div class="tree-room-meta">
          <span class="tree-room-count">${roomItems} items</span>
          <span class="tree-chevron ${isOpen ? "open" : ""}">▶</span>
        </div>
      </div>
      ${isOpen ? `<div class="tree-furniture">
        ${roomFurniture.map(f => {
          const cnt = state.items.filter(i => i.furnitureId === f.id).length;
          return `<div class="tree-furn-item">
            <span class="tree-furn-name">${f.name}</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="tree-furn-count">${cnt} items</span>
              <button class="tree-action-btn" onclick="event.stopPropagation();renameFurniture('${f.id}','${f.name.replace(/'/g,"\\'")}')">rename</button>
            </div>
          </div>`;
        }).join("")}
        <div style="padding:8px 14px 10px 42px;">
          <button class="add-btn-outline" onclick="addFurnitureToRoom('${room.id}')">+ Add location to ${room.name}</button>
        </div>
      </div>` : ""}
    </div>`;
  }).join("") + `<button class="add-btn-outline" onclick="addRoom()">+ Add new room</button>`;
}

function toggleRoom(id) {
  state.expandedRooms[id] = state.expandedRooms[id] === false ? true : false;
  renderMyHome();
}
window.toggleRoom = toggleRoom;

async function addRoom() {
  const name = prompt("Room name:");
  if (!name?.trim()) return;
  const icon = prompt("Room icon (emoji):", "🏠") || "🏠";
  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  await setDoc(doc(db, "rooms", id), { id, name: name.trim(), icon, order: state.rooms.length + 1 });
  showToast("Room added");
}
window.addRoom = addRoom;

async function addFurnitureToRoom(roomId) {
  const name = prompt("Location name:");
  if (!name?.trim()) return;
  const id = "f-" + Date.now();
  await setDoc(doc(db, "furniture", id), { id, roomId, name: name.trim(), order: state.furniture.filter(f => f.roomId === roomId).length + 1 });
  showToast("Location added");
}
window.addFurnitureToRoom = addFurnitureToRoom;

async function renameFurniture(id, currentName) {
  const name = prompt("Rename location:", currentName);
  if (!name?.trim() || name === currentName) return;
  await updateDoc(doc(db, "furniture", id), { name: name.trim() });
  showToast("Location renamed");
}
window.renameFurniture = renameFurniture;

// ── EXPORT ──
function renderExport() {
  document.getElementById("export-count").textContent = state.items.length;
}

function exportCSV() {
  const headers = ["Name", "Room", "Location", "Category", "Subcategory", "Quantity", "Price (€)", "Added By", "Date Added", "Date Purchased", "Expiry Date", "Notes"];
  const rows = state.items.map(i => [
    i.name,
    getRoomName(i.roomId),
    getFurnitureName(i.furnitureId),
    getCategoryName(i.categoryId),
    i.subcategory || "",
    i.quantity || 1,
    i.price || "",
    i.addedBy,
    i.dateAdded ? formatDate(i.dateAdded) : "",
    i.datePurchased || "",
    i.expiryDate || "",
    i.notes || ""
  ]);
  const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `home-explained-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  showToast("CSV downloaded");
}
window.exportCSV = exportCSV;

// ── MODAL ──
function openModal(id) { document.getElementById(id).classList.add("active"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }
window.openModal = openModal;
window.closeModal = closeModal;

// ── RENDER ALL ──
function renderAll() {
  if (state.currentScreen === "dashboard") renderDashboard();
  if (state.currentScreen === "inventory") renderInventory();
  if (state.currentScreen === "expiry") renderExpiry();
  if (state.currentScreen === "myhome") renderMyHome();
  if (state.currentScreen === "export") renderExport();
}

// ── LISTENERS ──
function setupListeners() {
  document.getElementById("search-input")?.addEventListener("input", e => handleSearch(e.target.value));
}

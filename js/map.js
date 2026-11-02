// 地図の中心と拡大率
const MAP_CENTER = [34.518, 132.511];
const MAP_ZOOM = 15;

const map = L.map("map").setView(MAP_CENTER, MAP_ZOOM);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let allSpots = [];
let markers = []; // { spot, marker }
let currentCategory = "すべて";

// ===== カテゴリごとの色 =====
const COLOR_PALETTE = ["#e08a1e", "#2b6c8f", "#8a4f9e", "#2f7d5b", "#c0392b", "#7f8c8d"];
const categoryColors = {};

function getColor(category) {
  if (!categoryColors[category]) {
    const index = Object.keys(categoryColors).length % COLOR_PALETTE.length;
    categoryColors[category] = COLOR_PALETTE[index];
  }
  return categoryColors[category];
}

function createIcon(color) {
  return L.divIcon({
    className: "pin-wrapper",
    html: '<span class="pin" style="background:' + color + '"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 31],
    popupAnchor: [0, -31]
  });
}

// ===== Googleマップのリンク =====
function googleMapsUrl(spot) {
  return "https://www.google.com/maps/search/?api=1&query=" + spot.lat + "," + spot.lng;
}

function createMapLink(spot) {
  const a = document.createElement("a");
  a.href = googleMapsUrl(spot);
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "Googleマップで開く";
  return a;
}

// ===== データの読み込み =====
async function loadSpots() {
  try {
    const response = await fetch("data/spots.json");
    allSpots = await response.json();
    allSpots.forEach(s => getColor(s.category)); // 色を先に決めておく
    renderFilter();
    renderAll();
  } catch (error) {
    document.getElementById("map-filter").textContent =
      "場所のデータを読み込めませんでした。";
    console.error(error);
  }
}

function visibleSpots() {
  return allSpots.filter(
    s => currentCategory === "すべて" || s.category === currentCategory
  );
}

// ===== カテゴリのボタン =====
function renderFilter() {
  const filterEl = document.getElementById("map-filter");
  const categories = ["すべて", ...new Set(allSpots.map(s => s.category))];
  filterEl.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat === currentCategory ? " active" : "");

    if (cat !== "すべて") {
      const dot = document.createElement("span");
      dot.className = "color-dot";
      dot.style.background = getColor(cat);
      btn.appendChild(dot);
    }
    btn.appendChild(document.createTextNode(cat));

    btn.addEventListener("click", () => {
      currentCategory = cat;
      renderFilter();
      renderAll();
    });
    filterEl.appendChild(btn);
  });
}

function renderAll() {
  renderMarkers();
  renderList();
}

// ===== 地図のピン =====
function createPopup(spot) {
  const popup = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = spot.name;
  const cat = document.createElement("div");
  cat.textContent = "[" + spot.category + "]";
  const desc = document.createElement("div");
  desc.textContent = spot.description;
  const linkWrap = document.createElement("div");
  linkWrap.appendChild(createMapLink(spot));
  popup.append(name, cat, desc, linkWrap);
  return popup;
}

function renderMarkers() {
  markers.forEach(m => m.marker.remove());
  markers = [];
  visibleSpots().forEach(s => {
    const marker = L.marker([s.lat, s.lng], { icon: createIcon(getColor(s.category)) })
      .addTo(map)
      .bindPopup(createPopup(s));
    markers.push({ spot: s, marker: marker });
  });
}

// ===== 場所の一覧 =====
function focusSpot(spot) {
  const item = markers.find(m => m.spot === spot);
  if (!item) return;
  map.setView([spot.lat, spot.lng], 17);
  item.marker.openPopup();
  document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderList() {
  const listEl = document.getElementById("spot-list");
  listEl.innerHTML = "";
  visibleSpots().forEach(s => {
    const card = document.createElement("article");
    card.className = "card spot-card";

    const nameBtn = document.createElement("button");
    nameBtn.className = "spot-name";
    const dot = document.createElement("span");
    dot.className = "color-dot";
    dot.style.background = getColor(s.category);
    nameBtn.append(dot, document.createTextNode(s.name));
    nameBtn.addEventListener("click", () => focusSpot(s));

    const cat = document.createElement("div");
    cat.className = "spot-category";
    cat.textContent = s.category;

    const desc = document.createElement("p");
    desc.textContent = s.description;

    const linkWrap = document.createElement("p");
    linkWrap.appendChild(createMapLink(s));

    card.append(nameBtn, cat, desc, linkWrap);
    listEl.appendChild(card);
  });
}

loadSpots();

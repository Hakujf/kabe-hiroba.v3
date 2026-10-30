// 地図の中心(可部周辺のおおよその位置。あとで調整できます)
const MAP_CENTER = [34.518, 132.511];
const MAP_ZOOM = 15;

const map = L.map("map").setView(MAP_CENTER, MAP_ZOOM);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let allSpots = [];
let markers = [];
let currentCategory = "すべて";

async function loadSpots() {
  try {
    const response = await fetch("data/spots.json");
    allSpots = await response.json();
    renderFilter();
    renderMarkers();
  } catch (error) {
    document.getElementById("map-filter").textContent =
      "場所のデータを読み込めませんでした。";
    console.error(error);
  }
}

function renderFilter() {
  const filterEl = document.getElementById("map-filter");
  const categories = ["すべて", ...new Set(allSpots.map(s => s.category))];
  filterEl.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "filter-btn" + (cat === currentCategory ? " active" : "");
    btn.addEventListener("click", () => {
      currentCategory = cat;
      renderFilter();
      renderMarkers();
    });
    filterEl.appendChild(btn);
  });
}

function renderMarkers() {
  markers.forEach(m => m.remove());
  markers = [];

  allSpots
    .filter(s => currentCategory === "すべて" || s.category === currentCategory)
    .forEach(s => {
      const popup = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = s.name;
      const cat = document.createElement("div");
      cat.textContent = "[" + s.category + "]";
      const desc = document.createElement("div");
      desc.textContent = s.description;
      popup.append(name, cat, desc);

      const marker = L.marker([s.lat, s.lng]).addTo(map).bindPopup(popup);
      markers.push(marker);
    });
}

loadSpots();
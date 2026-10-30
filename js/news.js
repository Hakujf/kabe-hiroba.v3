let allNews = [];
let currentCategory = "すべて";

async function loadNews() {
  const listEl = document.getElementById("news-list");
  try {
    const response = await fetch("data/news.json");
    allNews = await response.json();
    allNews.sort((a, b) => b.date.localeCompare(a.date)); // 新しい順
    renderFilter();
    renderNews();
  } catch (error) {
    listEl.textContent = "お知らせを読み込めませんでした。";
    console.error(error);
  }
}

function renderFilter() {
  const filterEl = document.getElementById("category-filter");
  const categories = ["すべて", ...new Set(allNews.map(n => n.category))];
  filterEl.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "filter-btn" + (cat === currentCategory ? " active" : "");
    btn.addEventListener("click", () => {
      currentCategory = cat;
      renderFilter();
      renderNews();
    });
    filterEl.appendChild(btn);
  });
}

function renderNews() {
  const listEl = document.getElementById("news-list");
  listEl.innerHTML = "";
  const items = allNews.filter(
    n => currentCategory === "すべて" || n.category === currentCategory
  );
  if (items.length === 0) {
    listEl.textContent = "該当するお知らせはありません。";
    return;
  }
  items.forEach(n => {
    const article = document.createElement("article");
    article.className = "news-item";

    const meta = document.createElement("div");
    meta.className = "news-meta";
    const date = document.createElement("time");
    date.textContent = n.date;
    const tag = document.createElement("span");
    tag.className = "news-tag";
    tag.textContent = n.category;
    meta.append(date, tag);

    const title = document.createElement("h3");
    title.textContent = n.title;
    const body = document.createElement("p");
    body.textContent = n.body;

    article.append(meta, title, body);
    listEl.appendChild(article);
  });
}

loadNews();
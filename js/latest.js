async function loadLatestNews() {
  const listEl = document.getElementById("latest-news");
  try {
    const response = await fetch("data/news.json");
    const news = await response.json();
    news.sort((a, b) => b.date.localeCompare(a.date));

    listEl.innerHTML = "";
    news.slice(0, 3).forEach(n => {
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

      article.append(meta, title);
      listEl.appendChild(article);
    });
  } catch (error) {
    listEl.textContent = "お知らせを読み込めませんでした。";
    console.error(error);
  }
}

loadLatestNews();
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 今日の日付を "YYYY-MM-DD" の形で返す
function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;　
}

// "2027-07-24" や "2027-10" を、年・月・日に分ける
function parseDate(text) {
  const [y, m, d] = text.split("-");
  return { y: Number(y), m: Number(m), d: d ? Number(d) : null };
}

function isMonthOnly(ev) {
  return ev.date.length === 7;
}

// これから(または今日)の行事かどうか
function isUpcoming(ev, today) {
  if (isMonthOnly(ev)) {
    return ev.date >= today.slice(0, 7);
  }
  const end = ev.endDate || ev.date;
  return end >= today;
}

function weekdayOf(p) {
  return WEEKDAYS[new Date(p.y, p.m - 1, p.d).getDay()];
}

function addLine(parent, className, text) {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  parent.appendChild(el);
}

function createEventCard(ev, isNext) {
  const p = parseDate(ev.date);

  const card = document.createElement("article");
  card.className = "event-card" + (isNext ? " next" : "");

  // 日付のバッジ
  const badge = document.createElement("div");
  badge.className = "event-date";
  const month = document.createElement("span");
  month.className = "event-month";
  month.textContent = p.m + "月";
  const day = document.createElement("span");
  day.className = "event-day";
  day.textContent = p.d ? String(p.d) : "—";
  const week = document.createElement("span");
  week.className = "event-weekday";
  week.textContent = p.d ? "(" + weekdayOf(p) + ")" : "日にち未定";
  badge.append(month, day, week);

  // 本文
  const body = document.createElement("div");
  body.className = "event-body";

  if (isNext) {
    const label = document.createElement("span");
    label.className = "event-label";
    label.textContent = "次の行事";
    body.appendChild(label);
  }

  const title = document.createElement("h4");
  title.className = "event-title";
  title.textContent = ev.title;
  body.appendChild(title);

  if (ev.category) {
    const tag = document.createElement("span");
    tag.className = "news-tag";
    tag.textContent = ev.category;
    body.appendChild(tag);
  }

  if (ev.endDate) {
    const e = parseDate(ev.endDate);
    addLine(body, "event-meta", "期間: 〜" + e.m + "月" + e.d + "日");
  }
  if (ev.place) addLine(body, "event-meta", "場所: " + ev.place);
  if (ev.description) addLine(body, "event-desc", ev.description);

  card.append(badge, body);
  return card;
}

// 月ごとの見出しをつけて並べる
function renderGroups(container, events, markNext, emptyText) {
  container.innerHTML = "";
  if (events.length === 0) {
    container.textContent = emptyText;
    return;
  }

  let currentMonth = "";
  let list = null;

  events.forEach((ev, i) => {
    const monthKey = ev.date.slice(0, 7);
    if (monthKey !== currentMonth) {
      currentMonth = monthKey;
      const p = parseDate(ev.date);
      const heading = document.createElement("h3");
      heading.className = "month-heading";
      heading.textContent = p.y + "年" + p.m + "月";
      container.appendChild(heading);

      list = document.createElement("div");
      list.className = "event-list";
      container.appendChild(list);
    }
    list.appendChild(createEventCard(ev, markNext && i === 0));
  });
}

async function loadEvents() {
  const upcomingEl = document.getElementById("upcoming-events");
  const pastEl = document.getElementById("past-events");
  try {
    const response = await fetch("data/events.json");
    const events = await response.json();
    const today = todayString();

    const upcoming = events
      .filter(e => isUpcoming(e, today))
      .sort((a, b) => a.date.localeCompare(b.date));
    const past = events
      .filter(e => !isUpcoming(e, today))
      .sort((a, b) => b.date.localeCompare(a.date));

    renderGroups(upcomingEl, upcoming, true, "予定されている行事はありません。");
    renderGroups(pastEl, past, false, "終了した行事はありません。");
  } catch (error) {
    upcomingEl.textContent = "行事の情報を読み込めませんでした。";
    console.error(error);
  }
}

loadEvents();

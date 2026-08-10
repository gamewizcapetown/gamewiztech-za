const API_BASE = 'https://dev.to/api/articles';
const FETCH_TAGS = ['gaming', 'gamedev', 'ai', 'machinelearning', 'linux', 'opensource', 'hardware', 'gpu', 'steam'];
const CATEGORY_MAP = {
  gaming: ['gaming', 'gamedev', 'esports', 'games', 'steam', 'valve'],
  ai: ['ai', 'machinelearning', 'llm', 'chatgpt', 'artificialintelligence', 'deeplearning', 'genai'],
  linux: ['linux', 'opensource', 'ubuntu', 'debian', 'foss'],
  hardware: ['hardware', 'raspberrypi', 'iot', 'arduino', 'robotics', 'gpu', 'intel', 'amd', 'nvidia', 'cpu', 'processor']
};
const CATEGORY_COLORS = {
  gaming: ['#0f530e', '#2e7d32'],
  it: ['#0d3b66', '#1565c0'],
  security: ['#7b1a1a', '#c62828'],
  hardware: ['#7b4a00', '#e65100']
};
const DEF_COLORS = ['#1a1a2e', '#16213e'];
const CACHE_KEY = 'gwt_news_cache';
const CACHE_DURATION = 10 * 60 * 1000;

let articles = [];
let currentFilter = 'all';

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) return data;
    }
  } catch {}
  return null;
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

function mapCategory(tags) {
  const lower = tags.map(t => t.toLowerCase());
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'it';
}

function getArticleImage(a) {
  return a.social_image || a.cover_image || `https://dev.to/social_previews/article/${a.id}.png`;
}

function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

async function fetchArticles() {
  const cached = getCache();
  if (cached) return cached;

  const results = await Promise.allSettled(
    FETCH_TAGS.map(tag =>
      fetch(`${API_BASE}?tag=${tag}&per_page=6`).then(r => r.json())
    )
  );

  const seen = new Set();
  const merged = [];
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const article of result.value) {
      if (!seen.has(article.id)) {
        seen.add(article.id);
        merged.push(article);
      }
    }
  }

  merged.sort(() => Math.random() - 0.5);
  setCache(merged);
  return merged;
}

function renderNews() {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  const filtered = currentFilter === 'all'
    ? articles
    : articles.filter(a => a.category === currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="news-empty">No articles in this category right now. Check back soon!</div>';
    return;
  }

  grid.innerHTML = filtered.map(a => {
    const img = a.image;
    const colors = CATEGORY_COLORS[a.category] || DEF_COLORS;
    return `
      <a href="${a.url}" target="_blank" rel="noopener" class="news-card" data-category="${a.category}">
        <div class="news-card-img" style="background-image: url(${img}); background-size: cover; background-position: center;"></div>
        <div class="news-card-body">
          <div class="news-card-meta">
            <span class="news-category ${a.category}">${a.category}</span>
            <span class="news-date">${a.date}</span>
          </div>
          <h3 class="news-card-title">${a.title}</h3>
          <p class="news-card-excerpt">${a.excerpt}</p>
          <span class="news-author">${a.author}</span>
        </div>
      </a>
    `;
  }).join('');
}

async function initNews() {
  try {
    const raw = await fetchArticles(30);
    articles = raw.map(a => ({
      id: a.id,
      title: a.title,
      excerpt: truncate(a.description, 150),
      category: mapCategory(a.tag_list),
      tags: a.tag_list,
      date: a.readable_publish_date || '',
      image: getArticleImage(a),
      url: a.url,
      author: a.user?.name ? `By ${a.user.name}` : ''
    }));
    renderNews();
  } catch {
    const grid = document.getElementById('newsGrid');
    if (grid) {
      grid.innerHTML = '<div class="news-empty">Could not load news. Please try again later.</div>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNews();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderNews();
    });
  });
});

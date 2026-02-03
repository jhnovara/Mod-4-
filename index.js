// API 1: "https://jsonplaceholder.typicode.com/users"
// API 2: "https://jsonplaceholder.typicode.com/posts?userId=2"

const userListEl = document.querySelector(".user-list"); /* Container for user cards */
const searchInput = document.getElementById('searchInput'); /* Search input field */
const suggestionsEl = document.getElementById('searchSuggestions'); /* Suggestions dropdown */
const searchForm = document.getElementById('searchForm'); /* Search form */
const clearBtn = document.getElementById('clearBtn'); /* Clear search button */

let breweries = []; /* Store all breweries */
let selectedSuggestion = -1; /* Track selected suggestion index */

async function main() { /* Main function to fetch and render breweries */
    const posts = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_city=Portland&by_state=Oregon&per_page=100`);
    breweries = await posts.json(); /* Fetch all breweries */
    breweries = breweries.filter(b => (b.state || '').toLowerCase() === 'oregon'); /* Ensure only Oregon breweries */ 
    renderList(breweries.slice(0, 6)); /* Initial render: first 6 breweries */
}

function renderList(items) {
  userListEl.innerHTML = items.map((user) => userHTML(user)).join(""); /* Render user cards */
}

main();

function showUserPosts(name) {
    localStorage.setItem("name", name); /* Store brewery name in localStorage */
    window.location.href = `${window.location.origin}/user.html`
}

searchInput && searchInput.addEventListener('input', onInput);
searchInput && searchInput.addEventListener('keydown', onKeyDown);
suggestionsEl && suggestionsEl.addEventListener('click', onSuggestionClick);
searchForm && searchForm.addEventListener('submit', onSubmit);
clearBtn && clearBtn.addEventListener('click', () => { searchInput.value = ''; updateSuggestions(); toggleClear(); renderList(breweries); searchInput.focus(); });

function onInput(e) {
  updateSuggestions();
  toggleClear();
}

function toggleClear() {
  if (!clearBtn) return;
  clearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
}

function updateSuggestions() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    suggestionsEl && suggestionsEl.classList.add('hidden');
    selectedSuggestion = -1;
    return;
  }
  const matches = breweries.filter(b => {
    return (b.name || '').toLowerCase().includes(q)
      || (b.brewery_type || '').toLowerCase().includes(q)
      || (b.city || '').toLowerCase().includes(q)
      || (b.state || '').toLowerCase().includes(q);
  }).slice(0, 6);

  if (!suggestionsEl) return;
  suggestionsEl.innerHTML = matches.map
  ((m, i) =>
     `\n    <li role="option" data-id="${escapeHtml(m.id || '')}" 
  data-name="${escapeHtml(m.name || '')}"
  data-type="${escapeHtml(m.brewery_type || '')}">\n      
  <strong>${escapeHtml(m.name || '')}
  </strong><span class="muted"> — 
  ${escapeHtml(m.brewery_type || '')} 
  · ${escapeHtml(m.city || '')}
   , ${escapeHtml(m.state || '')}
  </span>\n    </li>`).join('');

  if (matches.length === 0) {
    suggestionsEl.innerHTML = '<li class="muted">No results</li>';
  }
  suggestionsEl.classList.remove('hidden');
  selectedSuggestion = -1;
}

function onKeyDown(e) {
  if (!suggestionsEl || suggestionsEl.classList.contains('hidden')) return;
  const items = Array.from(suggestionsEl.querySelectorAll('li'));
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedSuggestion = Math.min(selectedSuggestion + 1, items.length - 1);
    updateActive(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedSuggestion = Math.max(selectedSuggestion - 1, 0);
    updateActive(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedSuggestion >= 0 && items[selectedSuggestion]) {
      items[selectedSuggestion].click();
    } else {
      onSubmit(e);
    }
  } else if (e.key === 'Escape') {
    suggestionsEl.classList.add('hidden');
  }
}

function updateActive(items) {
  items.forEach((el, i) => el.classList.toggle('active', i === selectedSuggestion));
  if (selectedSuggestion >= 0 && items[selectedSuggestion]) {
    items[selectedSuggestion].scrollIntoView({ block: 'nearest' });
  }
}

function onSuggestionClick(e) {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.getAttribute('data-id');
  const name = li.getAttribute('data-name') || li.textContent.trim();
  const type = li.getAttribute('data-type') || '';
  // Populate input: prefer name, otherwise type
  searchInput.value = name || type;
  suggestionsEl.classList.add('hidden');
  if (id) {
    const found = breweries.find(b => b.id && String(b.id) === id);
    if (found) return renderList([found]);
  }
  // fallback: filter by name or type
  const q = searchInput.value.trim().toLowerCase();
  const results = breweries.filter
  (b => 
    (b.name || '').toLowerCase().includes(q) || 
    (b.brewery_type || '').toLowerCase().includes(q),
  );

  renderList(results);
}

async function onSubmit(e) {
  e && e.preventDefault();

  const q = searchInput.value.trim();
  if (!q) {
    renderList(breweries);
    return;
  }

  const response = await fetch(
    `https://api.openbrewerydb.org/v1/breweries?by_city=Portland&by_state=Oregon&by_name=${q}&per_page=6`
  );

  const data = await response.json();
  renderList(data);

  suggestionsEl && suggestionsEl.classList.add('hidden');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (s) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s];
  });
}

function userHTML(user) {
  return `<div class=\"user\" onclick=\"showUserPosts('${user.id}')\">\n         
   <div class=\"user-card\">\n           
    <div class=\"user-card__container\">\n              
    <h3>${escapeHtml(user.name || '')}</h3>\n                
    <p><b>Brewery Type:</b> ${escapeHtml(user.brewery_type || '')}</p>\n                
    <p><b>Phone:</b> ${escapeHtml(user.phone || '')}</p>\n               
     <p><b>Address:</b> ${escapeHtml(user.street || '')}, ${escapeHtml(user.city || '')}, ${escapeHtml(user.state || '')}</p>\n               
      <p><b>website:</b> <a href=\"https://${escapeHtml(user.website_url || '')}\" target=\"_blank\">${escapeHtml(user.website_url || '')}</a></p>\n            
      </div>\n         
       </div>\n       
        </div>\n`;
}

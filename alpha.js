/* alpha.js — alphabetical slider + sorting
   - Assumes `window.breweries` and `renderList(items)` exist in index.js
*/
(function(){
  function filterByLetter(arr, letter){
    if(!Array.isArray(arr)) return [];
    if(!letter) return arr;
    const l = String(letter).toLowerCase();
    return arr.filter(item => (String(item.name||'')).toLowerCase().startsWith(l));
  }

  function alphabeticalSort(arr, {descending = false, locale = undefined} = {}){
    if(!Array.isArray(arr)) return [];
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    const sorted = arr.slice().sort((a,b) => collator.compare(String(a.name||''), String(b.name||'')));
    if(descending) sorted.reverse();
    return sorted;
  }

  function setActive(btn){
    document.querySelectorAll('.alpha-letter').forEach(b => b.classList.toggle('active', b === btn));
  }

  // State for showing paged results
  let _alphaResults = [];
  let _alphaLimit = 6;
  const _alphaChunk = 6;

  function ensureShowMoreButton() {
    const userListEl = document.querySelector('.user-list');
    if (!userListEl) return null;
    let btn = document.getElementById('alphaShowMore');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'alphaShowMore';
      btn.className = 'alpha-showmore';
      btn.textContent = 'Show more';
      btn.type = 'button';
      btn.style.margin = '12px auto';
      btn.style.display = 'block';
      btn.style.cursor = 'pointer';
      userListEl.insertAdjacentElement('afterend', btn);
      btn.addEventListener('click', () => {
        _alphaLimit += _alphaChunk;
        renderCurrent();
      });
    }
    return btn;
  }

  function removeShowMoreButton() {
    const btn = document.getElementById('alphaShowMore');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
  }

  function renderCurrent() {
    const userListEl = document.querySelector('.user-list');
    if (!_alphaResults || _alphaResults.length === 0) {
      if (userListEl) userListEl.innerHTML = '<div class="no-results">No results</div>';
      removeShowMoreButton();
      return;
    }
    const slice = _alphaResults.slice(0, _alphaLimit);
    if (typeof renderList === 'function') renderList(slice);
    // show or hide Show more
    if (_alphaResults.length > slice.length) {
      const btn = ensureShowMoreButton();
      if (btn) btn.style.display = 'block';
    } else {
      removeShowMoreButton();
    }
  }

  function renderListFor(letter){
    const base = window.breweries || [];
    const filtered = filterByLetter(base, letter);
    const sorted = alphabeticalSort(filtered, { descending: false });
    const userListEl = document.querySelector('.user-list');
    if (sorted.length === 0) {
      if (userListEl) {
        userListEl.innerHTML = '<div class="no-results">No results</div>';
        userListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      _alphaResults = [];
      removeShowMoreButton();
      return;
    }
    // initialize paging state and render first chunk
    _alphaResults = sorted;
    _alphaLimit = _alphaChunk;
    renderCurrent();
    if (userListEl) userListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderSorted(desc){
    const base = window.breweries || [];
    const sorted = alphabeticalSort(base, { descending: desc });
    const userListEl = document.querySelector('.user-list');
    if (sorted.length === 0) {
      if (userListEl) userListEl.innerHTML = '<div class="no-results">No results</div>';
      _alphaResults = [];
      removeShowMoreButton();
      return;
    }
    _alphaResults = sorted;
    _alphaLimit = _alphaChunk;
    renderCurrent();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const letters = Array.from(document.querySelectorAll('.alpha-letter'));
    const clearBtn = document.getElementById('alphaClearBtn');
    const sortAsc = document.getElementById('alphaSortAsc');
    const sortDesc = document.getElementById('alphaSortDesc');

    if(letters.length){
      letters.forEach(btn => {
        btn.addEventListener('click', () => {
          const letter = btn.getAttribute('data-letter') || '';
          setActive(btn);
          renderListFor(letter);
        });
        btn.addEventListener('keydown', (e) => {
          if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
      });
    }

    if(clearBtn) clearBtn.addEventListener('click', () => {
      setActive(null);
      _alphaResults = [];
      _alphaLimit = _alphaChunk;
      removeShowMoreButton();
      if(typeof renderList === 'function') renderList((window.breweries||[]).slice(0,12));
    });

    if(sortAsc) sortAsc.addEventListener('click', () => renderSorted(false));
    if(sortDesc) sortDesc.addEventListener('click', () => renderSorted(true));
  });
})();

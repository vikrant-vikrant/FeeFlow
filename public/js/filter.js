/* Utilities */
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* State */
let studentsNodes = [];           // cached <li> elements
let currentGradeFilter = 'all';
let currentSearchFilter = '';

const containerSelector = '.students';
const studentSelector = '.students .student';
const countEl = document.querySelector('#student-count');
const searchBox = document.querySelector('#searchBox');
const radios = document.querySelectorAll('input[name="radio"]');

/* (Re)cache DOM nodes — call this after AJAX or initial load */
function refreshCache() {
  studentsNodes = Array.from(document.querySelectorAll(studentSelector));
}

/* Matching helpers */
function matchesGrade(li, grade) {
  if (!grade || grade === 'all') return true;
  return String(li.dataset.grade) === String(grade);
}
function matchesSearch(li, search) {
  if (!search) return true;
  // prefer precomputed dataset.name else fallback to inner text
  const name = (li.dataset.name || li.querySelector('.details p')?.textContent || '').toLowerCase();
  return name.includes(search);
}

/* Apply both filters in a single pass (batched, no repeated layout checks) */
function applyFilters() {
  let visibleCount = 0;
  const search = currentSearchFilter.trim().toLowerCase();
  const grade = currentGradeFilter;

  // Use forEach and classList to toggle visibility (fast)
  studentsNodes.forEach(li => {
    const show = matchesGrade(li, grade) && matchesSearch(li, search);
    if (show) {
      li.classList.remove('hidden');
      visibleCount++;
    } else {
      li.classList.add('hidden');
    }
  });

  // update count once
  if (countEl) countEl.textContent = `All ${visibleCount}`;
}

/* Event handlers */
const onRadioChange = (e) => {
  currentGradeFilter = e.target.value;
  applyFilters();
};
const onSearchInput = debounce((e) => {
  currentSearchFilter = e.target.value || '';
  applyFilters();
}, 180);

/* Hook up listeners */
function initFilters() {
  refreshCache();
  radios.forEach(radio => radio.addEventListener('change', onRadioChange));
  if (searchBox) searchBox.addEventListener('input', onSearchInput);

  // run initial filter to ensure count correctness (useful if server-rendered list is already filtered)
  applyFilters();
}

/* Call this on page load */
initFilters();

/* If you update list via AJAX, call refreshCache() and applyFilters() after replacing DOM */
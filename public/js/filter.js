// cache for all students (keeps raw objects from server)
let cachedAll = null;
//what this function does is it creates a new list item element for a student, sets its attributes and content based on the student data, and returns the fully constructed list item ready to be added to the DOM. This approach helps prevent XSS vulnerabilities by ensuring that all data is treated as text content rather than HTML.
function createStudentLI(s) {
  const li = document.createElement("li");
  li.className = "student";
  li.dataset.grade = s.grade ?? "";
  li.dataset.name = s.searchName ?? "";
  li.dataset.due = String(s.dueFees ?? 0);

  const a = document.createElement("a");
  a.className = "list";
  a.href = `/students/${s._id}`;

  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName || s.name || "")}&bold=true&size=16&font-size=0.5&background=f3efea&color=31312f`;
  img.alt = s.fullName || s.name || "";

  const details = document.createElement("div");
  details.className = "details";

  const p = document.createElement("p");
  p.className = s.statusClass || "";
  p.textContent = s.name || "";

  const gradeSpan = document.createElement("span");
  gradeSpan.className = "grade";
  gradeSpan.textContent = s.grade ?? "";

  details.appendChild(p);
  details.appendChild(gradeSpan);

  if (s.dueFees > 0) {
    const dueSpan = document.createElement("span");
    dueSpan.className = "due";
    // formatted string from server if present else format here
    dueSpan.textContent =
      s.formattedDue || ` Due ${Number(s.dueFees).toLocaleString("en-IN")}₹`;
    details.appendChild(dueSpan);
  }

  a.appendChild(img);
  a.appendChild(details);
  li.appendChild(a);
  return li;
}

//what this function does is it takes an array of student objects, creates a list item for each student using the createStudentLI function, and then updates the studentsContainer element in the DOM to display the new list of students. It also updates the student count display to reflect the number of students currently shown.
function renderStudentsList(students) {
  const container = document.getElementById("studentsContainer");
  container.innerHTML = ""; // remove old
  const frag = document.createDocumentFragment();
  students.forEach((s) => frag.appendChild(createStudentLI(s)));
  container.appendChild(frag);

  // update counter
  const countEl = document.getElementById("student-count");
  if (countEl) countEl.innerText = `All ${students.length}`;
}

// client-side filter (no fetch)
function showDueOnlyLocal() {
  if (!cachedAll) return; // nothing to filter
  const dueOnly = cachedAll.filter((s) => Number(s.dueFees) > 0);
  renderStudentsList(dueOnly);
}

function showAllLocal() {
  if (!cachedAll) return;
  renderStudentsList(cachedAll);
}
// filter can be 'all' or 'due' (server does the filtering)
//what this function does is it checks if we already have a cached list of all students and if the requested filter is either "all" or "due" without forcing a refresh. If so, it uses the local cache to show the appropriate list of students. If not, it makes an asynchronous fetch request to the server to get the filtered list of students, updates the cache if necessary, and renders the new list in the DOM. It also includes error handling to display a user-friendly message if the fetch fails.
async function loadStudents(filter = "all", forceRefresh = false) {
  try {
    // if we already have full list and user asked for 'all' or 'due' without forceRefresh
    if (!forceRefresh && cachedAll && (filter === "all" || filter === "due")) {
      if (filter === "all") return showAllLocal();
      return showDueOnlyLocal();
    }

    // otherwise fetch from server
    const res = await fetch(`/students?filter=${filter}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await res.json();
    const students = payload.students ?? payload; // support both shapes
    // if this was a full list (filter !== 'due') cache it
    if (filter !== "due") {
      cachedAll = students;
    }
    renderStudentsList(students);
  } catch (err) {
    console.error("Error loading students:", err);
    // show friendly UI message
    const container = document.getElementById("studentsContainer");
    container.innerHTML = `<li class="error">Unable to load students. Try again.</li>`;
  }
}
//what this block of code does is it immediately executes a function that selects all the student list items currently in the DOM, extracts relevant data from their attributes and content, and stores this data in a cache variable called cachedAll. This allows the application to have a local copy of the student data for quick access and filtering without needing to make additional server requests.
(function cacheFromDOM() {
  const nodes = Array.from(
    document.querySelectorAll("#studentsContainer .student"),
  );
  if (!nodes.length) return;
  cachedAll = nodes.map((li) => ({
    _id: li.querySelector("a")?.getAttribute("href")?.split("/").pop(),
    name: li.querySelector(".details p")?.textContent?.trim() || "",
    fullName: li.querySelector("img")?.alt || "",
    grade: li.dataset.grade,
    dueFees: Number(li.dataset.due || 0),
    statusClass: li.querySelector(".details p")?.className || "normal",
    searchName: li.dataset.name || "",
  }));
})();

// filter section

/* Utilities */
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* State */
let studentsNodes = []; // cached <li> elements
let currentGradeFilter = "all";
let currentSearchFilter = "";

const countEl = document.querySelector("#student-count");
const searchBox = document.querySelector("#searchBox");
const radios = document.querySelectorAll('input[name="radio"]');

/* (Re)cache DOM nodes — call this after AJAX or initial load */
function refreshCache() {
  studentsNodes = Array.from(document.querySelectorAll(".students .student"));
}

/* Matching helpers */
function matchesGrade(li, grade) {
  if (!grade || grade === "all") return true;
  return String(li.dataset.grade) === String(grade);
}
function matchesSearch(li, search) {
  if (!search) return true;
  const name = (li.dataset.name || "").toLowerCase();
  return name.includes(search);
}

function applyFilters() {
  let visibleCount = 0;
  const search = currentSearchFilter.trim().toLowerCase();
  const grade = currentGradeFilter;
  // Use forEach and classList to toggle visibility (fast)
  studentsNodes.forEach((li) => {
    const show = matchesGrade(li, grade) && matchesSearch(li, search);
    if (show) {
      li.classList.remove("hidden");
      visibleCount++;
    } else {
      li.classList.add("hidden");
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
  currentSearchFilter = e.target.value || "";
  applyFilters();
}, 180);

/* Hook up listeners */
function initFilters() {
  refreshCache();
  radios.forEach((radio) => radio.addEventListener("change", onRadioChange));
  if (searchBox) searchBox.addEventListener("input", onSearchInput);
  applyFilters();
}
function removeFilters() {
  currentGradeFilter = "all";
  currentSearchFilter = "";
  if (searchBox) searchBox.value = "";
  document.querySelector(".radio input[type=radio]").checked = true; // set "All" as default
  const students = document.querySelectorAll(".student");
  students.forEach((s) => s.classList.remove("hidden"));
  initFilters(); // re-apply filters to update count and ensure consistency
}
showDueOnlyLocal(); //to show only due at frist glance
document.getElementById("btn-all")?.addEventListener("click", () => {
  loadStudents("all");
  removeFilters();
});
document.getElementById("btn-due")?.addEventListener("click", () => {
  loadStudents("due"); // use cache but apply due filter
  removeFilters();
});

/* Call this on page load */
initFilters();

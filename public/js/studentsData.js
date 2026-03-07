// cache for all students (keeps raw objects from server)
let cachedAll = null;

// helper to create one <li> node safely
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

// render list (replaces container contents)
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
// fetch from server (uses cache if we already have all)
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
showDueOnlyLocal()//to show only due at frist glance
// example hookups for buttons
document
  .getElementById("btn-all")
  ?.addEventListener("click", () => loadStudents("all"));
document
  .getElementById("btn-due")
  ?.addEventListener("click", () => loadStudents("due"));
const firstLink = document.getElementById("btn-due");
const secondLink = document.getElementById("btn-all");
secondLink.addEventListener("click", () => {
  firstLink.classList.toggle("active", false);
  secondLink.classList.toggle("active", true);
});
firstLink.addEventListener("click", () => {
  firstLink.classList.toggle("active", true);
  secondLink.classList.toggle("active", false);
});
document.querySelectorAll('input[name="radio"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    const selected = this.value;
    const students = document.querySelectorAll(".students .list");
    students.forEach((student) => {
      const grade = student.dataset.grade;
      if (selected === "all" || grade === selected) {
        student.style.display = "block";
      } else {
        student.style.display = "none";
      }
      updateCount();
    });
  });
});

function updateCount() {
  const visible = document.querySelectorAll(
    ".students .list:not([style*='display: none'])"
  ).length;
  document.querySelector(
    "#student-count"
  ).textContent = `Total students: ${visible}`;
}

document.querySelector("#searchBox").addEventListener("input", function () {
  const search = this.value.toLowerCase();
  const students = document.querySelectorAll(".students .list");

  students.forEach((student) => {
    const name = student.querySelector("h2").textContent.toLowerCase();
    student.style.display = name.includes(search) ? "block" : "none";
  });

  updateCount();
});

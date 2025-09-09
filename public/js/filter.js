document.querySelectorAll('input[name="radio"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    const selected = this.value; // selected grade
    const studentss = document.querySelectorAll(".students .list");

    studentss.forEach((students) => {
      students.style.display = "block";
      const grade = students.dataset.grade;
      if (!(grade === selected)) {
        students.style.display = "none";
      }
    });
  });
});

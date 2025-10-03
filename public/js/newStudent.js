const gradeFees = {
  Grade: 250,
  0: 250,
  "1st": 250,
  "2nd": 250,
  "3rd": 250,
  "4th": 300,
  "5th": 300,
  "6th": 400,
  "7th": 400,
  "8th": 500,
  "9th": 600,
  "10th": 700,
  "11th": 700,
  "12th": 700,
};
const gradeSelect = document.getElementById("grade");
const feesInput = document.getElementById("fees");
gradeSelect.addEventListener("change", function () {
  const selectedGrade = this.value;
  if (gradeFees[selectedGrade]) {
    feesInput.value = gradeFees[selectedGrade]; // auto-fill fee
  } else {
    feesInput.value = ""; // clear if no match
  }
});

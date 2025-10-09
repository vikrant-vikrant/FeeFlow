const express = require("express");
const router = express.Router();
const student = require("../controllers/students");
const validateObjectId = require("../middleware/validateObjectId");
router.route("/").get(student.students);
router
  .route("/newStudent")
  .get(student.newStudentForm)
  .post(student.addNewStudent);
router
  .route("/:id")
  .get(validateObjectId, student.showStudent)
  .delete(validateObjectId, student.deleteStudent);
router
  .route("/:id/edit")
  .get(validateObjectId, student.editStudent)
  .put(validateObjectId, student.saveEditStudent);
router.post("/:id/addFees", student.addFees);
module.exports = router;

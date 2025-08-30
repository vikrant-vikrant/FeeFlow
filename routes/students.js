const express = require("express");
const router = express.Router();
const studentControllers = require("../controllers/students");
router.route("/").get(studentControllers.students);
router
  .route("/newStudent")
  .get(studentControllers.newStudentForm)
  .post(studentControllers.addNewStudent);
router
  .route("/:id")
  .get(studentControllers.showStudent)
  .delete(studentControllers.deleteStudent);
router
  .route("/:id/edit")
  .get(studentControllers.editStudent)
  .put(studentControllers.saveEditStudent);
router.post("/:id/addFees", studentControllers.addFees);
module.exports = router;

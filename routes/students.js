const express = require("express");
const router = express.Router();
const student = require("../controllers/students");
const validateObjectId = require("../middleware/validateObjectId");
const { isLoggedIn } = require("../middleware/isLoggedIn");
router.route("/").get(isLoggedIn, student.students);
router
  .route("/newStudent")
  .get(isLoggedIn, student.newStudentForm)
  .post(isLoggedIn, student.addNewStudent);
router
  .route("/:id")
  .get(isLoggedIn, validateObjectId, student.showStudent)
  .delete(isLoggedIn, validateObjectId, student.deleteStudent);
router
  .route("/:id/edit")
  .get(isLoggedIn, validateObjectId, student.editStudent)
  .put(isLoggedIn, validateObjectId, student.saveEditStudent);
router.get("/:id/deactivate", student.deactivateStudent);
router.post("/:id/addFees", isLoggedIn, student.addFees);
module.exports = router;

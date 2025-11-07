const cron = require("node-cron");
const Student = require("../models/students");

async function addMonthlyDueFees() {
  try {
    const students = await Student.find();
    const today = new Date();
    for (let s of students) {
      if (!s.joiningDate) continue;
      if (today.getDate() !== s.joiningDate.getDate()) continue;
      const last = s.lastDueAdded;
      if (
        !last ||
        last.getMonth() !== today.getMonth()
      ) {
        s.dueFees = (s.dueFees || 0) + (s.fees || 0);
        s.lastDueAdded = today;
        await s.save();
        console.log(`Added due for ${s.name}`);
      } else {
        console.log(`⚠️ Already added fees for ${s.name} this month`);
      }
    }
  } catch (err) {
    console.error("Auto-due job error:", err);
  }
}

function startAll() {
  // run every day at 00:10
  cron.schedule(
    "10 0 * * *",
    () => {
      console.log("Running daily auto-due check");
      addMonthlyDueFees();
    },
    { timezone: "Asia/Kolkata" }
  );

  // put other cron jobs here
}

module.exports = { startAll, addMonthlyDueFees };

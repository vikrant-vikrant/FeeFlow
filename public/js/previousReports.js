const btn = document.getElementById("loadReportsBtn");
const container = document.getElementById("previousReports");
btn?.addEventListener("click", async () => {
  const page = Number(btn.dataset.page);
  btn.textContent = "Loading...";
  btn.disabled = true;
  try {
    const res = await fetch(`/fund/previous?page=${page}`);
    const reports = await res.json();
    if (reports.length === 0) {
      btn.textContent = "No more reports";
      return;
    }
    reports.forEach(renderReportCard);
    btn.dataset.page = page + 1;
    btn.textContent = "Load More Reports";
    btn.disabled = false;
  } catch (err) {
    console.error(err);
    btn.textContent = "Try again";
    btn.disabled = false;
  }
});

function renderReportCard(data) {
  const div = document.createElement("div");
  div.className = "report-card";
  const monthTitle = new Date(data.year, data.month - 1).toLocaleString(
    "en-US",
    { month: "short", year: "numeric" },
  );
  let totalExpenses = 0;
  data.expenses.forEach((e) => (totalExpenses += e.amount));
  div.innerHTML = `
    <div class="report-header">
      <h2 class="title">${monthTitle}</h2>
    </div>
    <div class="report-stats">
      <div class="stat">
        <div class="total">
            <span
              >${data.totalEarning.toLocaleString("en-IN")}₹</span
              ><br />Total Revenue
          </div>
      </div>
      <div class="stat new">
        <span>New Students: ${data.newStudents}</span>
        <span>Students Left: ${data.studentsLeft}</span>
      </div>
    </div>
    <div class="expense-section">
      <h3>Expense Details</h3>
      <ul>
        ${data.expenses
          .map(
            (e) => `
          <li>
            <span>${e.note}</span><br/>
            <span>${e.amount} ₹</span><br/>
            <span>${new Date(e.paidDate).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}</span>
          </li>
        `,
          )
          .join("")}
      </ul>
      <h3>Total Expenses: ${totalExpenses} ₹</h3>
    </div>
  `;
  container.appendChild(div);
}

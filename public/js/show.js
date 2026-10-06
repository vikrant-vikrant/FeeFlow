console.log("it is working");
const btn = document.querySelector("#showAll");
const container = document.querySelector(".feeHistory");
btn?.addEventListener("click", async () => {
  btn.textContent = "Loading...";
  try {
    const studentId = btn.dataset.studentId;
    const res = await fetch(`/students/showFeeHis/${studentId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch payment history");
    }
    const data = await res.json();
    container.innerHTML = `
      <h2 class="title">
        <i class="fa-solid fa-clock-rotate-left"></i>&nbsp;Payment History
      </h2>
    `;
    data.feesHistory.forEach((p) => {
      const div = document.createElement("div");
      div.className = "fee-entry";
      div.innerHTML = `
      <p>
        <strong>₹ ${p.amount}</strong> Paid On : 
        ${new Date(p.paidDate).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })} 
      </p>
      ${p.note ? `<p>Note : ${p.note}</p>` : ""}
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    btn.textContent = "Try again";
  }
  btn.textContent = "Data loaded";
});

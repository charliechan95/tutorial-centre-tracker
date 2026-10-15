/* Tutorial Centre Fees + Attendance + Receipts — static UI. Renders from db.js. */
"use strict";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---- Tabs --------------------------------------------------------------- */
document.querySelectorAll("[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((b) =>
      b.classList.toggle("active", b === btn));
    document.querySelectorAll(".view").forEach((v) =>
      v.classList.toggle("active", v.id === "view-" + btn.dataset.tab));
  });
});

const FEE_PILL = { unpaid: "未繳", paid: "已繳" };

function studentName(s) {
  return s ? s.name : "（已刪除學生）";
}
function courseName(c) {
  return c ? c.name : "（已刪除課程）";
}

/* ---- Dashboard ----------------------------------------------------------- */
function renderDashboard() {
  const month = TDB.thisMonth();
  TDB.ensureFees(month);
  document.getElementById("dash-month").textContent = TDB.monthLabel(month);
  const st = TDB.stats(month);
  document.getElementById("d-students").textContent = st.students;
  document.getElementById("d-collected").textContent = Math.round(st.collected);
  document.getElementById("d-unpaid-n").textContent = st.unpaid_count;
  document.getElementById("d-unpaid-sum").textContent =
    Math.round(st.unpaid_total);

  const unpaid = TDB.unpaidFees(month);
  document.getElementById("dash-unpaid").innerHTML = unpaid.length
    ? unpaid.map((f) => {
        const s = TDB.getStudent(f.student_id);
        const c = TDB.getCourse(f.course_id);
        const link = TDB.feeReminderLink(f.id);
        return `
      <tr>
        <td><strong>${esc(studentName(s))}</strong>
          <div class="muted">${esc(s ? s.parent_name : "")}</div></td>
        <td>${esc(courseName(c))}</td>
        <td>HK$${Math.round(f.amount)}</td>
        <td><div class="row-actions">
          ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">
            <button type="button">📩 提醒</button></a>`
            : `<span class="muted">欠電話號碼</span>`}
          <button data-paid="${f.id}">✓ 已繳</button>
        </div></td>
      </tr>`;
      }).join("")
    : `<tr><td colspan="4" class="muted">本月全部已繳清。</td></tr>`;
}

/* ---- Fees ------------------------------------------------------------------ */
const feeFilters = { month: "", q: "", status: "" };

function feeRow(f) {
  const s = TDB.getStudent(f.student_id);
  const c = TDB.getCourse(f.course_id);
  const link = TDB.feeReminderLink(f.id);
  const actions = f.status === "paid"
    ? `<button data-receipt="${f.id}">🧾 收據</button>
       <button data-unpaid="${f.id}">設為未繳</button>`
    : `${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">
         <button type="button">📩 WhatsApp 提醒</button></a>`
         : `<span class="muted">欠電話號碼</span>`}
       <button data-paid="${f.id}">✓ 標為已繳</button>`;
  return `
    <tr>
      <td><strong>${esc(studentName(s))}</strong>
        <div class="muted">${esc(s ? s.parent_name : "")}</div></td>
      <td>${esc(courseName(c))}</td>
      <td>${esc(TDB.monthLabel(f.month))}</td>
      <td>HK$${Math.round(f.amount)}</td>
      <td><span class="pill pill-${f.status}">${FEE_PILL[f.status] || f.status}</span>
        ${f.status === "paid" && f.method ? `<div class="muted">${esc(f.method)} ${esc(f.paid_date || "")}</div>` : ""}</td>
      <td><div class="row-actions">${actions}</div></td>
    </tr>`;
}

function renderFees() {
  if (!feeFilters.month) {
    feeFilters.month = TDB.thisMonth();
    document.getElementById("fee-month").value = feeFilters.month;
  }
  TDB.ensureFees(feeFilters.month);
  const list = TDB.fees(feeFilters.month, {
    status: feeFilters.status || null,
    search: feeFilters.q || null,
  });
  document.getElementById("fee-rows").innerHTML = list.length
    ? list.map(feeRow).join("")
    : `<tr><td colspan="6" class="muted">沒有記錄。</td></tr>`;
}

document.getElementById("fee-apply").addEventListener("click", () => {
  feeFilters.month = document.getElementById("fee-month").value || TDB.thisMonth();
  feeFilters.q = document.getElementById("fee-q").value.trim();
  feeFilters.status = document.getElementById("fee-status").value;
  renderFees();
});

/* ---- Students -------------------------------------------------------------- */
function renderStudents() {
  const courses = Object.fromEntries(
    TDB.courses().map((c) => [String(c.id), c]));
  document.getElementById("student-rows").innerHTML =
    TDB.students().length
      ? TDB.students().map((s) => `
        <tr>
          <td><strong>${esc(s.name)}</strong></td>
          <td>${esc(s.parent_name || "—")}
            <div class="muted">${esc(s.phone || "")}</div></td>
          <td>${(s.course_ids || []).map((id) =>
            esc(courses[String(id)] ? courses[String(id)].name : "（已刪除）"))
            .join("、") || "<span class=\"muted\">未報讀</span>"}</td>
          <td><div class="row-actions">
            <button data-edit-student="${s.id}">編輯</button>
            <button data-history="${s.id}">出席記錄</button>
            <button data-del-student="${s.id}">刪除</button>
          </div></td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="muted">未有學生。</td></tr>`;
}

const dlgStudent = document.getElementById("dlg-student");
let editingStudent = null;

function openStudentDialog(s) {
  editingStudent = s ? s.id : null;
  document.getElementById("dlg-student-title").textContent =
    s ? "編輯學生" : "新增學生";
  document.getElementById("st-name").value = s ? s.name : "";
  document.getElementById("st-parent").value = s ? (s.parent_name || "") : "";
  document.getElementById("st-phone").value = s ? (s.phone || "") : "";
  document.getElementById("st-courses").innerHTML = TDB.courses().length
    ? TDB.courses().map((c) => `
      <label class="check-line"><input type="checkbox" name="course_ids"
        value="${c.id}" ${s && (s.course_ids || []).map(String).includes(String(c.id)) ? "checked" : ""}>
        ${esc(c.name)} (HK$${Math.round(c.monthly_fee)}/月)</label>`).join("")
    : `<span class="muted">請先新增課程。</span>`;
  dlgStudent.showModal();
}

document.getElementById("btn-new-student").addEventListener("click", () =>
  openStudentDialog(null));

document.getElementById("frm-student").addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.submitter && e.submitter.value === "cancel") {
    dlgStudent.close();
    return;
  }
  const courseIds = [...document.querySelectorAll(
    '#st-courses input[name="course_ids"]:checked')].map((el) => el.value);
  const data = {
    name: document.getElementById("st-name").value.trim(),
    parent_name: document.getElementById("st-parent").value.trim(),
    phone: document.getElementById("st-phone").value.trim(),
    course_ids: courseIds,
  };
  if (!data.name) {
    alert("請輸入學生姓名。");
    return;
  }
  if (editingStudent) TDB.updateStudent(editingStudent, data);
  else TDB.createStudent(data);
  e.target.reset();
  dlgStudent.close();
  renderAll();
});

/* ---- Courses --------------------------------------------------------------- */
function renderCourses() {
  document.getElementById("course-rows").innerHTML =
    TDB.courses().length
      ? TDB.courses().map((c) => `
        <tr>
          <td><strong>${esc(c.name)}</strong></td>
          <td>HK$${Math.round(c.monthly_fee)}</td>
          <td>${esc(c.schedule_note || "—")}</td>
          <td><div class="row-actions">
            <button data-edit-course="${c.id}">編輯</button>
            <button data-del-course="${c.id}">刪除</button>
          </div></td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="muted">未有課程。</td></tr>`;
}

const dlgCourse = document.getElementById("dlg-course");
let editingCourse = null;

function openCourseDialog(c) {
  editingCourse = c ? c.id : null;
  document.getElementById("dlg-course-title").textContent =
    c ? "編輯課程" : "新增課程";
  document.getElementById("c-name").value = c ? c.name : "";
  document.getElementById("c-fee").value = c ? c.monthly_fee : "";
  document.getElementById("c-sched").value = c ? (c.schedule_note || "") : "";
  dlgCourse.showModal();
}

document.getElementById("btn-new-course").addEventListener("click", () =>
  openCourseDialog(null));

document.getElementById("frm-course").addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.submitter && e.submitter.value === "cancel") {
    dlgCourse.close();
    return;
  }
  const data = {
    name: document.getElementById("c-name").value.trim(),
    monthly_fee: document.getElementById("c-fee").value,
    schedule_note: document.getElementById("c-sched").value.trim(),
  };
  if (!data.name) {
    alert("請輸入課程名稱。");
    return;
  }
  if (editingCourse) TDB.updateCourse(editingCourse, data);
  else TDB.createCourse(data);
  e.target.reset();
  dlgCourse.close();
  renderAll();
});

/* ---- Attendance -------------------------------------------------------------- */
function loadAttendanceCourseOptions() {
  document.getElementById("att-course").innerHTML =
    TDB.courses().map((c) =>
      `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  if (!document.getElementById("att-date").value) {
    document.getElementById("att-date").value = TDB.today();
  }
}

function renderAttendance() {
  const courseId = document.getElementById("att-course").value;
  const date = document.getElementById("att-date").value;
  if (!courseId || !date) {
    document.getElementById("att-rows").innerHTML =
      `<tr><td colspan="4" class="muted">請選擇課程及日期。</td></tr>`;
    return;
  }
  const roster = TDB.sessionRoster(courseId, date);
  document.getElementById("att-hint").textContent =
    `${esc(TDB.monthLabel(date.slice(0, 7)))} ${esc(date.slice(8))}日 — 共 ${roster.length} 位學生，按一下即時儲存。`;
  document.getElementById("att-rows").innerHTML = roster.length
    ? roster.map(({ student, mark, session_id }) => `
      <tr>
        <td><strong>${esc(student.name)}</strong></td>
        <td>${esc(student.parent_name || "—")}</td>
        <td>${mark === "present"
          ? `<span class="pill mark-present">出席</span>`
          : mark === "absent"
            ? `<span class="pill mark-absent">缺席</span>`
            : `<span class="muted">未點名</span>`}</td>
        <td><div class="row-actions">
          <button data-mark="present" data-session="${session_id}"
            data-student="${student.id}"
            ${mark === "present" ? "disabled" : ""}>✓ 出席</button>
          <button data-mark="absent" data-session="${session_id}"
            data-student="${student.id}"
            ${mark === "absent" ? "disabled" : ""}>✗ 缺席</button>
        </div></td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="muted">此課程未有學生。</td></tr>`;
}

document.getElementById("att-load").addEventListener("click", renderAttendance);

/* ---- Mark paid dialog ----------------------------------------------------------- */
const dlgPaid = document.getElementById("dlg-paid");
document.getElementById("p-method").innerHTML =
  FEE_METHODS.map((m) => `<option>${m}</option>`).join("");

document.getElementById("frm-paid").addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.submitter && e.submitter.value === "cancel") {
    dlgPaid.close();
    return;
  }
  TDB.markPaid(document.getElementById("p-feeid").value, {
    paid_date: document.getElementById("p-date").value || TDB.today(),
    method: document.getElementById("p-method").value,
  });
  dlgPaid.close();
  renderAll();
});

/* ---- Receipt dialog --------------------------------------------------------------- */
const dlgReceipt = document.getElementById("dlg-receipt");

function openReceipt(feeId) {
  const text = TDB.receiptText(feeId);
  if (!text) return;
  document.getElementById("receipt-sheet").textContent = text;
  document.getElementById("r-wa").href = TDB.receiptWaLink(feeId) || "#";
  dlgReceipt.dataset.feeid = feeId;
  dlgReceipt.showModal();
}

document.getElementById("r-close").addEventListener("click", () =>
  dlgReceipt.close());
document.getElementById("r-copy").addEventListener("click", async () => {
  const text = document.getElementById("receipt-sheet").textContent;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("r-copy").textContent = "已複製 ✓";
    setTimeout(() => {
      document.getElementById("r-copy").textContent = "複製文字";
    }, 1500);
  } catch {
    alert("複製失敗，請手動選取文字複製。");
  }
});
document.getElementById("r-print").addEventListener("click", () =>
  window.print());

/* ---- Attendance history dialog ------------------------------------------------------ */
const dlgHistory = document.getElementById("dlg-history");
document.getElementById("h-close").addEventListener("click", () =>
  dlgHistory.close());

function openHistory(studentId) {
  const s = TDB.getStudent(studentId);
  const h = TDB.studentHistory(studentId);
  document.getElementById("h-title").textContent =
    `出席記錄 — ${esc(studentName(s))}`;
  document.getElementById("h-summary").textContent =
    `出席 ${h.present} 次，缺席 ${h.absent} 次。`;
  document.getElementById("h-rows").innerHTML = h.rows.length
    ? h.rows.map((r) => `
      <tr>
        <td>${esc(r.date)}</td>
        <td>${esc(r.course)}</td>
        <td>${r.mark === "present"
          ? `<span class="pill mark-present">出席</span>`
          : `<span class="pill mark-absent">缺席</span>`}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" class="muted">未有點名記錄。</td></tr>`;
  dlgHistory.showModal();
}

/* ---- Global row actions (delegated) --------------------------------------------- */
document.addEventListener("click", (e) => {
  const paid = e.target.closest("[data-paid]");
  if (paid) {
    const f = TDB.getFee(paid.dataset.paid);
    if (!f) return;
    const s = TDB.getStudent(f.student_id);
    const c = TDB.getCourse(f.course_id);
    document.getElementById("p-feeid").value = f.id;
    document.getElementById("p-desc").textContent =
      `${studentName(s)} — ${courseName(c)} — ${TDB.monthLabel(f.month)} — HK$${Math.round(f.amount)}`;
    document.getElementById("p-date").value = TDB.today();
    dlgPaid.showModal();
    return;
  }
  const unpaid = e.target.closest("[data-unpaid]");
  if (unpaid) {
    if (confirm("將此筆學費改回「未繳」？")) {
      TDB.markUnpaid(unpaid.dataset.unpaid);
      renderAll();
    }
    return;
  }
  const receipt = e.target.closest("[data-receipt]");
  if (receipt) {
    openReceipt(receipt.dataset.receipt);
    return;
  }
  const mark = e.target.closest("[data-mark]");
  if (mark) {
    TDB.saveMark(mark.dataset.session, mark.dataset.student, mark.dataset.mark);
    renderAttendance();
    return;
  }
  const editC = e.target.closest("[data-edit-course]");
  if (editC) {
    openCourseDialog(TDB.getCourse(editC.dataset.editCourse));
    return;
  }
  const delC = e.target.closest("[data-del-course]");
  if (delC) {
    if (confirm("確定刪除此課程？")) {
      if (!TDB.deleteCourse(delC.dataset.delCourse)) {
        alert("此課程仍有學生報讀，請先移除學生才可刪除。");
      }
      renderAll();
    }
    return;
  }
  const editS = e.target.closest("[data-edit-student]");
  if (editS) {
    openStudentDialog(TDB.getStudent(editS.dataset.editStudent));
    return;
  }
  const delS = e.target.closest("[data-del-student]");
  if (delS) {
    if (confirm("確定刪除此學生？其學費及點名記錄會一併刪除。")) {
      TDB.deleteStudent(delS.dataset.delStudent);
      renderAll();
    }
    return;
  }
  const hist = e.target.closest("[data-history]");
  if (hist) {
    openHistory(hist.dataset.history);
  }
});

/* ---- Settings ---------------------------------------------------------------------- */
function loadSettings() {
  const s = TDB.settings();
  document.getElementById("s-centre").value = s.centre_name || "";
  document.getElementById("s-fps-id").value = s.fps_id || "";
  document.getElementById("s-fps-name").value = s.fps_name || "";
  document.getElementById("s-phone").value = s.phone || "";
  document.getElementById("s-msg").value = s.fee_reminder_message || "";
}
document.getElementById("frm-settings").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {};
  new FormData(e.target).forEach((v, k) => { data[k] = v; });
  TDB.saveSettings(data);
  const el = document.getElementById("settings-saved");
  el.textContent = "已儲存 ✓";
  setTimeout(() => { el.textContent = ""; }, 2000);
});

/* ---- Boot ---------------------------------------------------------------------------- */
function renderAll() {
  renderDashboard();
  renderFees();
  loadAttendanceCourseOptions();
  renderStudents();
  renderCourses();
}
loadSettings();
renderAll();

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

function feePill(status) {
  return status === "paid" ? t("opt_paid") : t("opt_unpaid");
}

const METHOD_LABEL_KEY = {
  "FPS": "method_fps", "現金": "method_cash", "銀行轉賬": "method_bank",
  "PayMe": "method_payme", "其他": "method_other",
};
function methodLabel(m) {
  const k = METHOD_LABEL_KEY[m];
  return k ? t(k) : (m || "");
}

function studentName(s) {
  return s ? s.name : t("deleted_student");
}
function courseName(c) {
  return c ? c.name : t("deleted_course");
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
            <button type="button">${t("btn_remind")}</button></a>`
            : `<span class="muted">${t("no_phone")}</span>`}
          <button data-paid="${f.id}">${t("btn_paid_check")}</button>
        </div></td>
      </tr>`;
      }).join("")
    : `<tr><td colspan="4" class="muted">${t("all_paid")}</td></tr>`;
}

/* ---- Fees ------------------------------------------------------------------ */
const feeFilters = { month: "", q: "", status: "" };

function feeRow(f) {
  const s = TDB.getStudent(f.student_id);
  const c = TDB.getCourse(f.course_id);
  const link = TDB.feeReminderLink(f.id);
  const actions = f.status === "paid"
    ? `<button data-receipt="${f.id}">${t("btn_receipt")}</button>
       <button data-unpaid="${f.id}">${t("btn_set_unpaid")}</button>`
    : `${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">
         <button type="button">${t("btn_wa_remind")}</button></a>`
         : `<span class="muted">${t("no_phone")}</span>`}
       <button data-paid="${f.id}">${t("btn_mark_paid")}</button>`;
  return `
    <tr>
      <td><strong>${esc(studentName(s))}</strong>
        <div class="muted">${esc(s ? s.parent_name : "")}</div></td>
      <td>${esc(courseName(c))}</td>
      <td>${esc(TDB.monthLabel(f.month))}</td>
      <td>HK$${Math.round(f.amount)}</td>
      <td><span class="pill pill-${f.status}">${FEE_PILL[f.status] || f.status}</span>
        ${f.status === "paid" && f.method ? `<div class="muted">${esc(methodLabel(f.method))} ${esc(f.paid_date || "")}</div>` : ""}</td>
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
    : `<tr><td colspan="6" class="muted">${t("no_records")}</td></tr>`;
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
            esc(courses[String(id)] ? courses[String(id)].name : t("deleted_short")))
            .join(LANG === "en" ? ", " : "、") || "<span class=\"muted\">" + t("not_enrolled") + "</span>"}</td>
          <td><div class="row-actions">
            <button data-edit-student="${s.id}">${t("btn_edit")}</button>
            <button data-history="${s.id}">${t("btn_history")}</button>
            <button data-del-student="${s.id}">${t("btn_delete")}</button>
          </div></td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="muted">${t("no_students")}</td></tr>`;
}

const dlgStudent = document.getElementById("dlg-student");
let editingStudent = null;

function openStudentDialog(s) {
  editingStudent = s ? s.id : null;
  document.getElementById("dlg-student-title").textContent =
    s ? t("dlg_student_edit") : t("dlg_student_new");
  document.getElementById("st-name").value = s ? s.name : "";
  document.getElementById("st-parent").value = s ? (s.parent_name || "") : "";
  document.getElementById("st-phone").value = s ? (s.phone || "") : "";
  document.getElementById("st-courses").innerHTML = TDB.courses().length
    ? TDB.courses().map((c) => `
      <label class="check-line"><input type="checkbox" name="course_ids"
        value="${c.id}" ${s && (s.course_ids || []).map(String).includes(String(c.id)) ? "checked" : ""}>
        ${esc(c.name)} (HK$${Math.round(c.monthly_fee)}${t("per_month")})</label>`).join("")
    : `<span class="muted">${t("add_course_first")}</span>`;
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
    alert(t("alert_student_name"));
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
            <button data-edit-course="${c.id}">${t("btn_edit")}</button>
            <button data-del-course="${c.id}">${t("btn_delete")}</button>
          </div></td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="muted">${t("no_courses")}</td></tr>`;
}

const dlgCourse = document.getElementById("dlg-course");
let editingCourse = null;

function openCourseDialog(c) {
  editingCourse = c ? c.id : null;
  document.getElementById("dlg-course-title").textContent =
    c ? t("dlg_course_edit") : t("dlg_course_new");
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
    alert(t("alert_course_name"));
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
      `<tr><td colspan="4" class="muted">${t("att_choose")}</td></tr>`;
    return;
  }
  const roster = TDB.sessionRoster(courseId, date);
  document.getElementById("att-hint").textContent = t("att_hint_tmpl")
    .replace("{month}", TDB.monthLabel(date.slice(0, 7)))
    .replace("{day}", String(parseInt(date.slice(8), 10)))
    .replace("{n}", roster.length);
  document.getElementById("att-rows").innerHTML = roster.length
    ? roster.map(({ student, mark, session_id }) => `
      <tr>
        <td><strong>${esc(student.name)}</strong></td>
        <td>${esc(student.parent_name || "—")}</td>
        <td>${mark === "present"
          ? `<span class="pill mark-present">${t("mark_present")}</span>`
          : mark === "absent"
            ? `<span class="pill mark-absent">${t("mark_absent")}</span>`
            : `<span class="muted">${t("mark_none")}</span>`}</td>
        <td><div class="row-actions">
          <button data-mark="present" data-session="${session_id}"
            data-student="${student.id}"
            ${mark === "present" ? "disabled" : ""}>${t("btn_present")}</button>
          <button data-mark="absent" data-session="${session_id}"
            data-student="${student.id}"
            ${mark === "absent" ? "disabled" : ""}>${t("btn_absent")}</button>
        </div></td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="muted">${t("att_no_students")}</td></tr>`;
}

document.getElementById("att-load").addEventListener("click", renderAttendance);

/* ---- Mark paid dialog ----------------------------------------------------------- */
const dlgPaid = document.getElementById("dlg-paid");
function buildMethodOptions() {
  document.getElementById("p-method").innerHTML = FEE_METHODS.map((m) =>
    `<option value="${esc(m)}">${esc(methodLabel(m))}</option>`).join("");
}
buildMethodOptions();

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
    document.getElementById("r-copy").textContent = t("btn_copied");
    setTimeout(() => {
      document.getElementById("r-copy").textContent = t("btn_copy");
    }, 1500);
  } catch {
    alert(t("copy_fail"));
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
    t("history_title").replace("{name}", studentName(s));
  document.getElementById("h-summary").textContent =
    t("history_summary").replace("{p}", h.present).replace("{a}", h.absent);
  document.getElementById("h-rows").innerHTML = h.rows.length
    ? h.rows.map((r) => `
      <tr>
        <td>${esc(r.date)}</td>
        <td>${esc(r.course)}</td>
        <td>${r.mark === "present"
          ? `<span class="pill mark-present">${t("mark_present")}</span>`
          : `<span class="pill mark-absent">${t("mark_absent")}</span>`}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" class="muted">${t("no_history")}</td></tr>`;
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
    if (confirm(t("confirm_unpaid"))) {
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
    if (confirm(t("confirm_del_course"))) {
      if (!TDB.deleteCourse(delC.dataset.delCourse)) {
        alert(t("alert_course_blocked"));
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
    if (confirm(t("confirm_del_student"))) {
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
  el.textContent = t("saved");
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
window.onLangChange = function () { buildMethodOptions(); };
loadSettings();
renderAll();
applyI18n();

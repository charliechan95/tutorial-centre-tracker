/* Tutorial Centre Fees + Attendance + Receipts — static data layer.
   localStorage-backed, no backend. WhatsApp via wa.me deep links. */
"use strict";

const FEE_METHODS = ["FPS", "現金", "銀行轉賬", "PayMe", "其他"];

const DEFAULT_SETTINGS = {
  centre_name: "",
  fps_id: "",
  fps_name: "",
  phone: "",
  fee_reminder_message:
    "您好{parent}，這是{centre}的學費提醒：" +
    "{student}同學的{course}課程，{month}學費 HK${amount} 尚未繳交。" +
    "請 FPS 到 {fps_id}（{fps_name}），謝謝！",
};

const TDB = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  _write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  _nextSeq(name) {
    const n = (parseInt(localStorage.getItem(name) || "0", 10) || 0) + 1;
    localStorage.setItem(name, String(n));
    return n;
  },
  _nextId() {
    return this._nextSeq("tct_seq");
  },
  today() {
    return new Date().toISOString().slice(0, 10);
  },
  thisMonth() {
    return new Date().toISOString().slice(0, 7);
  },
  monthLabel(m) {
    const parts = String(m || "").split("-");
    if (parts.length !== 2) return String(m || "");
    return parts[0] + "年" + parseInt(parts[1], 10) + "月";
  },

  // ---- Settings ------------------------------------------------------------
  settings() {
    const stored = this._read("tct_settings", {});
    return { ...DEFAULT_SETTINGS, ...stored };
  },
  saveSettings(data) {
    const stored = this._read("tct_settings", {});
    for (const k of Object.keys(DEFAULT_SETTINGS)) {
      if (k in data) stored[k] = data[k];
    }
    this._write("tct_settings", stored);
  },

  // ---- Courses -------------------------------------------------------------
  courses() {
    return this._read("tct_courses", []);
  },
  getCourse(id) {
    return this.courses().find((c) => String(c.id) === String(id)) || null;
  },
  createCourse(data) {
    const list = this.courses();
    const course = {
      id: this._nextId(),
      name: data.name || "",
      monthly_fee: parseFloat(data.monthly_fee) || 0,
      schedule_note: data.schedule_note || "",
    };
    list.push(course);
    this._write("tct_courses", list);
    return course.id;
  },
  updateCourse(id, data) {
    const list = this.courses();
    const c = list.find((x) => String(x.id) === String(id));
    if (!c) return false;
    if ("name" in data) c.name = data.name;
    if ("monthly_fee" in data) c.monthly_fee = parseFloat(data.monthly_fee) || 0;
    if ("schedule_note" in data) c.schedule_note = data.schedule_note;
    this._write("tct_courses", list);
    return true;
  },
  /** Delete only when no student is enrolled; returns false if blocked. */
  deleteCourse(id) {
    const used = this.students().some((s) =>
      (s.course_ids || []).map(String).includes(String(id)));
    if (used) return false;
    const list = this.courses().filter((c) => String(c.id) !== String(id));
    this._write("tct_courses", list);
    return true;
  },

  // ---- Students --------------------------------------------------------------
  students() {
    return this._read("tct_students", []);
  },
  getStudent(id) {
    return this.students().find((s) => String(s.id) === String(id)) || null;
  },
  createStudent(data) {
    const list = this.students();
    const student = {
      id: this._nextId(),
      name: data.name || "",
      parent_name: data.parent_name || "",
      phone: data.phone || "",
      course_ids: Array.isArray(data.course_ids)
        ? data.course_ids.map(String) : [],
    };
    list.push(student);
    this._write("tct_students", list);
    return student.id;
  },
  updateStudent(id, data) {
    const list = this.students();
    const s = list.find((x) => String(x.id) === String(id));
    if (!s) return false;
    if ("name" in data) s.name = data.name;
    if ("parent_name" in data) s.parent_name = data.parent_name;
    if ("phone" in data) s.phone = data.phone;
    if ("course_ids" in data) {
      s.course_ids = Array.isArray(data.course_ids)
        ? data.course_ids.map(String) : [];
    }
    this._write("tct_students", list);
    return true;
  },
  /** Delete student and cascade their fee + attendance records. */
  deleteStudent(id) {
    const sid = String(id);
    this._write("tct_students",
      this.students().filter((s) => String(s.id) !== sid));
    this._write("tct_fees",
      this._read("tct_fees", []).filter((f) => String(f.student_id) !== sid));
    this._write("tct_marks",
      this._read("tct_marks", []).filter((m) => String(m.student_id) !== sid));
    return true;
  },

  // ---- Fees ------------------------------------------------------------------
  /**
   * Ensure every enrolled student×course has a fee record for the month.
   * Amount is copied from the course's CURRENT monthly fee at creation.
   */
  ensureFees(month) {
    const courses = Object.fromEntries(
      this.courses().map((c) => [String(c.id), c]));
    const fees = this._read("tct_fees", []);
    const has = new Set(fees.map((f) =>
      `${f.student_id}|${f.course_id}|${f.month}`));
    for (const s of this.students()) {
      for (const cid of (s.course_ids || []).map(String)) {
        const c = courses[cid];
        if (!c) continue;
        const key = `${s.id}|${cid}|${month}`;
        if (has.has(key)) continue;
        fees.push({
          id: this._nextId(),
          student_id: s.id,
          course_id: cid,
          month,
          amount: parseFloat(c.monthly_fee) || 0,
          status: "unpaid",
          paid_date: null,
          method: null,
          receipt_no: null,
        });
        has.add(key);
      }
    }
    this._write("tct_fees", fees);
  },
  fees(month, { status, search } = {}) {
    let list = this._read("tct_fees", []);
    if (month) list = list.filter((f) => f.month === month);
    if (status) list = list.filter((f) => f.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => {
        const s = this.getStudent(f.student_id);
        const c = this.getCourse(f.course_id);
        return (((s && s.name) || "") + " " + ((c && c.name) || ""))
          .toLowerCase().includes(q);
      });
    }
    const sname = (f) => {
      const s = this.getStudent(f.student_id);
      return s ? s.name : "";
    };
    return [...list].sort((a, b) =>
      sname(a).localeCompare(sname(b), "zh-Hant"));
  },
  getFee(id) {
    return this._read("tct_fees", []).find(
      (f) => String(f.id) === String(id)) || null;
  },
  markPaid(id, { paid_date, method } = {}) {
    const list = this._read("tct_fees", []);
    const f = list.find((x) => String(x.id) === String(id));
    if (!f) return false;
    if (!method) return false; // never invent a payment method (no guessing)
    f.status = "paid";
    f.paid_date = paid_date || this.today();
    f.method = method;
    this._write("tct_fees", list);
    return true;
  },
  markUnpaid(id) {
    const list = this._read("tct_fees", []);
    const f = list.find((x) => String(x.id) === String(id));
    if (!f) return false;
    f.status = "unpaid";
    f.paid_date = null;
    f.method = null;
    this._write("tct_fees", list);
    return true;
  },
  unpaidFees(month) {
    return this.fees(month, { status: "unpaid" });
  },
  stats(month) {
    const fees = this.fees(month);
    const paid = fees.filter((f) => f.status === "paid");
    const unpaid = fees.filter((f) => f.status !== "paid");
    return {
      students: this.students().length,
      courses: this.courses().length,
      collected: paid.reduce((s, f) => s + (f.amount || 0), 0),
      unpaid_count: unpaid.length,
      unpaid_total: unpaid.reduce((s, f) => s + (f.amount || 0), 0),
    };
  },

  // ---- Receipts ----------------------------------------------------------------
  _nextReceiptNo() {
    const n = this._nextSeq("tct_receipt_seq");
    return "R" + String(n).padStart(5, "0");
  },
  receiptData(feeId) {
    const f = this.getFee(feeId);
    if (!f || f.status !== "paid") return null;
    const s = this.settings();
    if (!f.receipt_no) {
      f.receipt_no = this._nextReceiptNo();
      const list = this._read("tct_fees", []);
      const row = list.find((x) => String(x.id) === String(feeId));
      if (row) row.receipt_no = f.receipt_no;
      this._write("tct_fees", list);
    }
    const student = this.getStudent(f.student_id);
    const course = this.getCourse(f.course_id);
    return {
      no: f.receipt_no,
      date: f.paid_date || this.today(),
      centre: s.centre_name || "",
      student: student ? student.name : "",
      course: course ? course.name : "",
      month: this.monthLabel(f.month),
      amount: f.amount || 0,
      method: f.method || "",
      fps_id: s.fps_id || "",
      fps_name: s.fps_name || "",
      phone: s.phone || "",
    };
  },
  receiptText(feeId) {
    const r = this.receiptData(feeId);
    if (!r) return "";
    return [
      (r.centre || "學費收據"),
      "收據編號：" + r.no,
      "日期：" + r.date,
      "學生：" + r.student,
      "課程：" + r.course,
      "項目：" + r.month + " 學費",
      "金額：HK$" + r.amount,
      "付款方式：" + r.method,
      "多謝惠顧！",
    ].join("\n");
  },

  // ---- WhatsApp ------------------------------------------------------------------
  _digits(phone) {
    let d = String(phone || "").replace(/\D/g, "");
    if (/^\d{8}$/.test(d)) d = "852" + d;
    return d;
  },
  waLink(phone, message) {
    const d = this._digits(phone);
    if (!d) return "";
    return "https://wa.me/" + d + "?text=" + encodeURIComponent(message);
  },
  fill(template, vars) {
    return Object.keys(vars).reduce((t, k) =>
      t.replaceAll("{" + k + "}", vars[k] == null ? "" : String(vars[k])),
      template);
  },
  feeReminderLink(feeId) {
    const f = this.getFee(feeId);
    if (!f) return "";
    const s = this.settings();
    const student = this.getStudent(f.student_id);
    const course = this.getCourse(f.course_id);
    const msg = this.fill(s.fee_reminder_message, {
      parent: (student && student.parent_name) || (student && student.name) || "",
      student: (student && student.name) || "",
      course: (course && course.name) || "",
      month: this.monthLabel(f.month),
      amount: f.amount || 0,
      centre: s.centre_name || "",
      fps_id: s.fps_id || "",
      fps_name: s.fps_name || "",
      phone: s.phone || "",
    });
    return this.waLink(student ? student.phone : "", msg);
  },
  receiptWaLink(feeId) {
    const text = this.receiptText(feeId);
    if (!text) return "";
    const f = this.getFee(feeId);
    const student = this.getStudent(f.student_id);
    return this.waLink(student ? student.phone : "", text);
  },

  // ---- Attendance ----------------------------------------------------------------
  _sessions() {
    return this._read("tct_sessions", []);
  },
  session(courseId, date) {
    const list = this._sessions();
    let sess = list.find((x) =>
      String(x.course_id) === String(courseId) && x.date === date);
    if (!sess) {
      sess = { id: this._nextId(), course_id: courseId, date };
      list.push(sess);
      this._write("tct_sessions", list);
    }
    return sess;
  },
  saveMark(sessionId, studentId, mark) {
    if (mark !== "present" && mark !== "absent") return false;
    const list = this._read("tct_marks", []);
    let row = list.find((m) =>
      String(m.session_id) === String(sessionId) &&
      String(m.student_id) === String(studentId));
    if (row) {
      row.mark = mark;
    } else {
      list.push({ session_id: sessionId, student_id: studentId, mark });
    }
    this._write("tct_marks", list);
    return true;
  },
  /** Roster for a course+date: enrolled students with their current marks. */
  sessionRoster(courseId, date) {
    const sess = this.session(courseId, date);
    const marks = Object.fromEntries(
      this._read("tct_marks", [])
        .filter((m) => String(m.session_id) === String(sess.id))
        .map((m) => [String(m.student_id), m.mark]));
    return this.students()
      .filter((s) => (s.course_ids || []).map(String).includes(String(courseId)))
      .map((s) => ({ student: s, mark: marks[String(s.id)] || null,
        session_id: sess.id }));
  },
  studentHistory(studentId) {
    const sid = String(studentId);
    const sessions = Object.fromEntries(
      this._sessions().map((x) => [String(x.id), x]));
    const rows = this._read("tct_marks", [])
      .filter((m) => String(m.student_id) === sid)
      .map((m) => {
        const sess = sessions[String(m.session_id)];
        if (!sess) return null;
        const c = this.getCourse(sess.course_id);
        return { date: sess.date, course: c ? c.name : "（已刪除課程）",
          mark: m.mark };
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date));
    return {
      present: rows.filter((r) => r.mark === "present").length,
      absent: rows.filter((r) => r.mark === "absent").length,
      rows,
    };
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = TDB;
}

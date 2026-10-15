/* i18n — EN / 繁中 language switch for the tutorial centre tracker.
   UI language only; user data is never translated. Persisted per browser. */
"use strict";

const I18N = {
  zh: {
    title: "補習社收費及點名",
    brand: "📚 收費及點名",
    tab_dashboard: "主頁", tab_fees: "學費", tab_attendance: "點名",
    tab_students: "學生", tab_courses: "課程", tab_settings: "設定",
    dash_title: "主頁",
    card_students: "學生人數", card_collected: "本月已收 (HKD)",
    card_unpaid_n: "未繳人數", card_unpaid_sum: "未繳總額 (HKD)",
    dash_unpaid_title: "⚠️ 本月未繳學費",
    th_student: "學生", th_course: "課程", th_amount: "金額",
    th_month: "月份", th_status: "狀態", th_parent: "家長",
    th_parent_phone: "家長 / 電話", th_enrolled: "報讀課程",
    th_monthly_fee: "月費", th_schedule: "上課時間", th_date: "日期",
    fees_title: "學費記錄", ph_search_student: "搜尋學生…",
    opt_all: "全部", opt_unpaid: "未繳", opt_paid: "已繳",
    btn_query: "查詢",
    att_title: "點名", btn_load_roster: "載入名單",
    att_hint_static: "選擇課程及日期，按學生逐一點名（即時儲存）。",
    students_title: "學生", btn_new_student: "+ 新增學生",
    courses_title: "課程", btn_new_course: "+ 新增課程",
    settings_title: "中心設定",
    settings_note: "FPS 資料會自動加入 WhatsApp 訊息。",
    lbl_centre_name: "中心名稱",
    lbl_fps_id: "FPS ID（電話 / 電郵 / 轉數快代號）",
    ph_example_phone: "例如 91234567",
    lbl_fps_name: "FPS 戶口名稱", ph_fps_name: "例如 Chan Tai Man",
    lbl_phone: "中心電話", lbl_reminder_msg: "學費提醒訊息",
    reminder_vars: "可用：", btn_save_settings: "儲存設定",
    dlg_course_new: "新增課程", dlg_course_edit: "編輯課程",
    lbl_course_name: "課程名稱", lbl_course_fee: "月費 (HKD)",
    lbl_course_sched: "上課時間", ph_sched: "例如 逢星期六 10:00",
    btn_cancel: "取消", btn_save: "儲存", btn_confirm: "確認",
    dlg_student_new: "新增學生", dlg_student_edit: "編輯學生",
    lbl_student_name: "學生姓名", lbl_parent_name: "家長姓名",
    lbl_student_phone: "電話 / WhatsApp", ph_phone: "例如 91234567",
    lbl_enrolled_courses: "報讀課程：",
    dlg_paid_title: "標為已繳", lbl_paid_date: "繳費日期",
    lbl_paid_method: "付款方式",
    dlg_receipt_title: "收據", btn_close: "關閉", btn_copy: "複製文字",
    btn_copied: "已複製 ✓", btn_print: "列印",
    btn_wa_send: "WhatsApp 傳送", dlg_history_title: "出席記錄",
    deleted_student: "（已刪除學生）", deleted_course: "（已刪除課程）",
    deleted_short: "（已刪除）", no_phone: "欠電話號碼",
    btn_remind: "📩 提醒", btn_paid_check: "✓ 已繳",
    all_paid: "本月全部已繳清。",
    btn_receipt: "🧾 收據", btn_set_unpaid: "設為未繳",
    btn_wa_remind: "📩 WhatsApp 提醒", btn_mark_paid: "✓ 標為已繳",
    no_records: "沒有記錄。", not_enrolled: "未報讀",
    btn_edit: "編輯", btn_delete: "刪除", btn_history: "出席記錄",
    no_students: "未有學生。", add_course_first: "請先新增課程。",
    per_month: "/月",
    alert_student_name: "請輸入學生姓名。",
    alert_course_name: "請輸入課程名稱。",
    no_courses: "未有課程。",
    att_choose: "請選擇課程及日期。",
    att_hint_tmpl: "{month} {day}日 — 共 {n} 位學生，按一下即時儲存。",
    mark_present: "出席", mark_absent: "缺席", mark_none: "未點名",
    btn_present: "✓ 出席", btn_absent: "✗ 缺席",
    att_no_students: "此課程未有學生。",
    copy_fail: "複製失敗，請手動選取文字複製。",
    history_title: "出席記錄 — {name}",
    history_summary: "出席 {p} 次，缺席 {a} 次。",
    no_history: "未有點名記錄。",
    confirm_unpaid: "將此筆學費改回「未繳」？",
    confirm_del_course: "確定刪除此課程？",
    alert_course_blocked: "此課程仍有學生報讀，請先移除學生才可刪除。",
    confirm_del_student: "確定刪除此學生？其學費及點名記錄會一併刪除。",
    saved: "已儲存 ✓",
    method_fps: "FPS", method_cash: "現金", method_bank: "銀行轉賬",
    method_payme: "PayMe", method_other: "其他",
  },
  en: {
    title: "Tutorial Centre Fees & Attendance",
    brand: "📚 Fees & Attendance",
    tab_dashboard: "Home", tab_fees: "Fees", tab_attendance: "Attendance",
    tab_students: "Students", tab_courses: "Courses", tab_settings: "Settings",
    dash_title: "Home",
    card_students: "Students", card_collected: "Collected this month (HKD)",
    card_unpaid_n: "Unpaid students", card_unpaid_sum: "Total unpaid (HKD)",
    dash_unpaid_title: "⚠️ Unpaid fees this month",
    th_student: "Student", th_course: "Course", th_amount: "Amount",
    th_month: "Month", th_status: "Status", th_parent: "Parent",
    th_parent_phone: "Parent / Phone", th_enrolled: "Enrolled courses",
    th_monthly_fee: "Monthly fee", th_schedule: "Schedule", th_date: "Date",
    fees_title: "Fee records", ph_search_student: "Search students…",
    opt_all: "All", opt_unpaid: "Unpaid", opt_paid: "Paid",
    btn_query: "Search",
    att_title: "Attendance", btn_load_roster: "Load roster",
    att_hint_static: "Pick a course and date, then mark each student (saves instantly).",
    students_title: "Students", btn_new_student: "+ New student",
    courses_title: "Courses", btn_new_course: "+ New course",
    settings_title: "Centre settings",
    settings_note: "Your FPS details are added to WhatsApp messages automatically.",
    lbl_centre_name: "Centre name",
    lbl_fps_id: "FPS ID (phone / email / FPS identifier)",
    ph_example_phone: "e.g. 91234567",
    lbl_fps_name: "FPS account name", ph_fps_name: "e.g. Chan Tai Man",
    lbl_phone: "Centre phone", lbl_reminder_msg: "Fee reminder message",
    reminder_vars: "Available:", btn_save_settings: "Save settings",
    dlg_course_new: "New course", dlg_course_edit: "Edit course",
    lbl_course_name: "Course name", lbl_course_fee: "Monthly fee (HKD)",
    lbl_course_sched: "Schedule", ph_sched: "e.g. Sat 10:00",
    btn_cancel: "Cancel", btn_save: "Save", btn_confirm: "Confirm",
    dlg_student_new: "New student", dlg_student_edit: "Edit student",
    lbl_student_name: "Student name", lbl_parent_name: "Parent name",
    lbl_student_phone: "Phone / WhatsApp", ph_phone: "e.g. 91234567",
    lbl_enrolled_courses: "Enrolled courses:",
    dlg_paid_title: "Mark as paid", lbl_paid_date: "Payment date",
    lbl_paid_method: "Payment method",
    dlg_receipt_title: "Receipt", btn_close: "Close", btn_copy: "Copy text",
    btn_copied: "Copied ✓", btn_print: "Print",
    btn_wa_send: "Send via WhatsApp", dlg_history_title: "Attendance history",
    deleted_student: "(deleted student)", deleted_course: "(deleted course)",
    deleted_short: "(deleted)", no_phone: "No phone number",
    btn_remind: "📩 Remind", btn_paid_check: "✓ Paid",
    all_paid: "All fees are settled this month.",
    btn_receipt: "🧾 Receipt", btn_set_unpaid: "Set unpaid",
    btn_wa_remind: "📩 WhatsApp reminder", btn_mark_paid: "✓ Mark paid",
    no_records: "No records.", not_enrolled: "Not enrolled",
    btn_edit: "Edit", btn_delete: "Delete", btn_history: "History",
    no_students: "No students yet.", add_course_first: "Add a course first.",
    per_month: "/mo",
    alert_student_name: "Please enter the student's name.",
    alert_course_name: "Please enter the course name.",
    no_courses: "No courses yet.",
    att_choose: "Pick a course and date first.",
    att_hint_tmpl: "{month} {day} — {n} students. Tap a button to save instantly.",
    mark_present: "Present", mark_absent: "Absent", mark_none: "Not marked",
    btn_present: "✓ Present", btn_absent: "✗ Absent",
    att_no_students: "No students in this course.",
    copy_fail: "Copy failed. Please select the text and copy it manually.",
    history_title: "Attendance history — {name}",
    history_summary: "Present {p} times, absent {a} times.",
    no_history: "No attendance records yet.",
    confirm_unpaid: "Set this fee back to unpaid?",
    confirm_del_course: "Delete this course?",
    alert_course_blocked: "Students are still enrolled in this course. Remove them first, then delete it.",
    confirm_del_student: "Delete this student? Their fee and attendance records will be deleted too.",
    saved: "Saved ✓",
    method_fps: "FPS", method_cash: "Cash", method_bank: "Bank transfer",
    method_payme: "PayMe", method_other: "Other",
  },
};

let LANG = "zh";
try {
  LANG = localStorage.getItem("tct_lang") === "en" ? "en" : "zh";
} catch { /* storage unavailable: keep default */ }

function t(key) {
  return (I18N[LANG] && I18N[LANG][key]) || I18N.zh[key] || key;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll("[data-lang-btn]").forEach((b) =>
    b.classList.toggle("active", b.dataset.langBtn === LANG));
  document.documentElement.lang = LANG === "zh" ? "zh-Hant" : "en";
  document.title = t("title");
}

function setLang(next) {
  if (next !== "zh" && next !== "en") return;
  LANG = next;
  try { localStorage.setItem("tct_lang", LANG); } catch { /* ignore */ }
  applyI18n();
  if (typeof renderAll === "function") renderAll();
  if (typeof window.onLangChange === "function") window.onLangChange();
}

document.querySelectorAll("[data-lang-btn]").forEach((b) =>
  b.addEventListener("click", () => setLang(b.dataset.langBtn)));

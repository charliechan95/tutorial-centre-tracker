# 補習社收費及點名 (Tutorial Centre Fees + Attendance + Receipts)

Static web app for small HK tutorial / activity centres. No backend —
all data in browser localStorage.

## The job it does

1. **學費** — pick a month → fee records auto-create from course fees →
   mark 已繳 (date + method) or 未繳 → unpaid list → one-tap WhatsApp
   reminder (wa.me, manual send) → receipt for paid records.
2. **點名** — pick course + date → tap ✓出席 / ✗缺席 per student
   (saved instantly) → per-student attendance history.
3. **🧾 收據** — plain-text receipt (number auto-assigned R00001…),
   with 複製 / 列印 (print CSS) / WhatsApp send.
4. **主頁** — this month: student count, collected total,
   unpaid count + total.

## Files

- `index.html` — views: 主頁 / 學費 / 點名 / 學生 / 課程 / 設定
- `db.js` — localStorage data layer (courses, students, fees,
  attendance sessions + marks, receipts, WhatsApp links)
- `app.js` — UI rendering, Traditional Chinese
- `style.css` — shared theme with the other tracker apps
- `vercel.json` — static hosting config (cleanUrls)

## Notes

- WhatsApp uses `wa.me` deep links; the owner taps send in WhatsApp.
  No paid API.
- HK 8-digit phone numbers are auto-prefixed with 852.
- Deleting a student cascades their fee + attendance records
  (with confirm). A course cannot be deleted while students are enrolled.
- Receipt numbers are sequential per browser (R00001…).

/**
 * Tucheng English Day — optional live sync (Google Apps Script + Google Sheets)
 *
 * 1. 建立一個新的 Google 試算表 → 擴充功能 → Apps Script → 把這個檔案的內容整個貼上 → 儲存。
 * 2. 部署 → 新增部署作業 → 類型「網頁應用程式」
 *      執行身分：我　　誰可以存取：任何人
 * 3. 複製「網頁應用程式網址」(…/exec)，貼到每台電視與 Mission Control 的 ⚙ 設定「同步網址」。
 *
 * Stations POST events here; Mission Control GETs ?action=state for the live board.
 * Only English names, seat numbers, grades and what the AI heard are stored — no audio, no photos.
 */
const SHEET = "events";
const COLS = ["time", "gate", "kid", "name", "grade", "type", "say", "heard", "by", "stars", "letter"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(COLS); sh.setFrozenRows(1); }
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const events = body.events || [body];
    const rows = events.map(function (r) {
      return [r.t || new Date().toISOString(), r.gate || "", r.kid || "", r.name || "", r.grade || "", r.type || "",
              r.say || "", r.heard || "", r.by || "", r.stars || "", r.letter || ""];
    });
    if (rows.length) { const sh = sheet_(); sh.getRange(sh.getLastRow() + 1, 1, rows.length, COLS.length).setValues(rows); }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, n: rows.length })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "state";
  if (action !== "state") return ContentService.createTextOutput("ok");
  const values = sheet_().getDataRange().getValues();
  const kids = {}; let lines = 0;
  for (let i = 1; i < values.length; i++) {
    const r = values[i]; const gate = +r[1], kid = String(r[2] || ""), type = r[5];
    if (type === "line") lines++;
    if (!kid) continue;
    const id = kid.length < 2 ? "0" + kid : kid;
    const k = kids[id] || (kids[id] = { name: r[3], grade: r[4], gates: [], final: false });
    if (type === "complete" && gate >= 1 && gate <= 6 && k.gates.indexOf(gate) < 0) k.gates.push(gate);
    if (type === "final") k.final = true;
  }
  return ContentService.createTextOutput(JSON.stringify({ kids: kids, lines: lines, updated: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

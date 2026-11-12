# Tucheng English Day · 土城國小運動會英語日 英語護照闖關

六間教室 × 六個大螢幕觸控遊戲，內容全部取自《土城國小英語護照》700 字的單字與例句。孩子帶著紙本護照、掃描貼在護照裡的 QR 登機卡，和老師用英文對話；瀏覽器的 AI 語音辨識聽懂了，遊戲就往前推進。每關結束得到全息印章，再翻護照解出一個秘密字母；六個字母拼成 **FRIEND**（剛好是護照第 111 號單字），到「終點登機門」說出 *“We are friends!”* 領取獎狀。

| 關卡 | 遊戲 | 參考的熱門玩法 | 觸控 | 護照內容 |
|---|---|---|---|---|
| 1 Tokyo | Turbo Talk Kart 極速英語賽車 | 賽車 | 點左右換車道吃星星 | 第1關交通工具、第7關序數 |
| 2 Sydney | Pixel Craft 方塊創造家 | 方塊建造 | 點選顏色、點方塊讓它跳 | 第19關顏色、want、favorite |
| 3 Paris | Pet Hatch 英語寵物孵蛋 | 孵蛋收集寵物 | 點蛋敲裂、點選最愛寵物 | 第1關動物、第9–10關形容詞 |
| 4 Cairo | Beat Party 英語節奏派對 | 節奏舞蹈 | DJ 鼓墊 | 第25關教室用語、動詞 |
| 5 Vancouver | Mystery Box 神秘盲盒 | 開箱盲盒 | 翻線索卡、搖箱子、點開 3D 盲盒 | 第19–21關食物 |
| 6 San Diego | Sports Day Obby 運動會障礙跑酷 | 障礙跑酷 | 按大按鈕跳／游／爬／飛 | 動詞、運動、can |

## 每位孩子在一關裡的流程
👋 暖身對話（名字／心情／年齡）→ 🎮 遊戲 4–6 回合（老師問、孩子答、AI 聽）→ 🎉 全班一起說 → 🧩 句子拼拼看（排護照例句再唸）→ 🛂 護照密碼（翻護照找編號單字，第一個字母就是密碼）→ 全息印章＋播放孩子的英文原聲。快速模式只保留遊戲 3 回合＋護照密碼。

## 頁面
- `index.html` 總入口
- `station.html?gate=1`…`6` 六個關卡（各教室的觸控電視）；📋 看本關老師台詞、⚙ 設定、⭐ 貴賓體驗
- `opening.html` 開場動畫（大廳大螢幕，七個畫面介紹規則，可自動播放）
- `control.html` 終點登機門（解碼、獎狀列印）＋即時看板
- `cards.html` 列印護照 QR 登機卡（每頁 8 張）
- `teacher-cards.html` 關主一頁卡（每關一張 A4，可直接列印）
- `phone.html` 老師手機掃描蓋章（備援）
- `guide.html` 活動手冊（流程、時間表、各關台詞、設備、部長參訪路線、備援、隱私）
- `credits.html` 真人發音來源與授權

## 技術重點
- 純 HTML/JS，不需要安裝；Chrome 或 Edge。第一次開過後可離線使用（service worker），只有語音辨識需要網路。
- 語音辨識：Web Speech API（en-US），對兒童口音寬鬆比對（含常見近音字）；老師問句不含答案字，避免 AI 把老師的聲音當成孩子的答案；聽不到時老師按 ✓（或 Enter）。
- QR：USB／藍牙 2D 掃描機（鍵盤模式，中文輸入法開著也能讀）、webcam（jsQR）、手動選擇，或 ⭐ 貴賓按鈕。
- 分級：QR 內含年級 → 自動對應護照初級／中級／高級，可隨時切換。
- 發音：120 個 Wikimedia Commons 美式英語真人錄音，每個都用 Commons 公布的 SHA-1 逐一驗證；來源、錄音者、授權見 `assets/audio/credits.json` 與 `credits.html`。沒有真人錄音的句子使用標示「電腦語音」的瀏覽器語音。
- 圖案：全部為本專案原創、以程式繪製的 3D 亮面公仔風格圖（`js/art.js`），沒有使用第三方圖庫或遊戲角色。
- 選用同步：`apps-script/Code.gs`（Google Apps Script + 試算表）匯整六間教室進度到即時看板。
- 隱私：名單、錄音、照片只留在各台電腦；QR 只有座號、年級、英文名字。

## 上線（GitHub Pages）
每次推送都會由 `.github/workflows/pages.yml` 自動把網站發佈到 `gh-pages` 分支（網址：https://imacipadtw-lang.github.io/123456/english-quest/）。若第一次沒有自動開啟：Settings → Pages → Deploy from a branch → `gh-pages` / (root)。使用 https 網址，瀏覽器才會允許麥克風與相機。

**備用網址（Claude）**：https://claude.ai/artifact/EGDBXGnMnVbkMtdUMgWxjn（每關加 `#gate-1`…`#gate-6`、`#final`、`#opening`）。主網址打不開時使用；需登入老師的 claude.ai 帳號，沒有麥克風／相機／列印。所有網址見 `links.html`。

## 測試紀錄（Playwright／Chromium）
- 六關從掃描到印章完整跑完（含 1366×768、1600×900、3840×2160 版面與觸控模擬）
- 隨機點擊／按鍵／中途掃描／Esc 的壓力測試：六關皆無錯誤
- 40 組答案比對測試（含近音字與同關字詞不互相誤判）
- QR 卡列印後可被正確解碼；獎狀與 QR 卡 A4 列印版面
- 離線重新載入、Google Apps Script 同步邏輯（模擬伺服器）
- 語音辨識與真實麥克風、實體掃描機需在學校現場測試

## 授權
- 護照單字與例句：© 南投縣草屯鎮土城國小（《土城國小英語護照》）。
- 發音檔：依 Commons 原授權（CC BY-SA 3.0／4.0、CC BY 4.0、CC0 或公眾領域），錄音者見 credits。
- 原創圖案與程式：本活動自用。字型 Fredoka（OFL 1.1）、jsQR（Apache-2.0）、qrcode-generator（MIT）。

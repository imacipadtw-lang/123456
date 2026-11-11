# Tucheng English Day · 土城國小運動會英語日 英語護照闖關

六間教室 × 六個遊戲關卡，配合《土城國小英語護照》700 字的單字與句型。孩子掃描護照上的 QR 登機卡，和老師用英文對話；瀏覽器的 AI 語音辨識聽到關鍵字，遊戲就往前推進。每過一關得到一個全息印章和一個秘密字母，六個字母拼成 **FRIEND**，到「終點登機門」解碼並說出 *“We are friends!”* 領取獎狀。

| 關卡 | 遊戲 | 類型 | 護照內容 |
|---|---|---|---|
| 1 Tokyo | Turbo Talk Kart 極速英語賽車 | 賽車 | 第1關交通工具、第7關序數 |
| 2 Sydney | Pixel Craft 方塊創造家 | 方塊建造 | 第19關顏色、want、favorite |
| 3 Paris | Animal Catch 英語動物捕捉隊 | 收集 | 第1關動物、第9–10關形容詞 |
| 4 Cairo | Beat Party 英語節奏派對 | 節奏舞蹈 | 第25關教室用語、動詞 |
| 5 Vancouver | Mystery Box 神秘盲盒 | 開箱 | 第19–21關食物 |
| 6 San Diego | Sports Day Obby 運動會障礙跑酷 | 障礙跑酷 | 動詞、運動、can |

## 頁面
- `index.html` 總入口
- `station.html?gate=1`…`6` 六個關卡（放在各教室的觸控電視）
- `control.html` 終點登機門＋即時看板（大廳）
- `cards.html` 列印護照 QR 登機卡
- `phone.html` 老師手機掃描蓋章（備援）
- `guide.html` 活動手冊（流程、各關台詞、設備、部長參訪路線、備援、隱私）
- `credits.html` 真人發音來源與授權

## 技術重點
- 純 HTML/JS，不需要安裝或伺服器；建議用 Chrome 或 Edge。
- 語音辨識：Web Speech API（en-US），需要網路；沒有網路或辨識失敗時老師按 ✓（或 Enter）。
- QR：USB／藍牙 2D 掃描機（鍵盤模式，中文輸入法開著也能讀）、webcam（jsQR）、或手動選擇。
- 分級：QR 內含年級 → 自動對應護照初級／中級／高級。
- 發音：單字使用 Wikimedia Commons 美式英語真人錄音（來源與授權見 `assets/audio/credits.json`、`credits.html`）；沒有真人錄音的句子使用標示「電腦語音」的瀏覽器語音。
- 選用同步：`apps-script/Code.gs`（Google Apps Script + 試算表）匯整六間教室的進度到看板。
- 隱私：名單、錄音、照片都只留在各台電腦；QR 只有座號、年級、英文名字。

## 上線（GitHub Pages）
Settings → Pages → Source 選 **GitHub Actions**。之後推到 main 分支就會自動部署（`.github/workflows/pages.yml`）。

## 授權
- 遊戲程式：學校自用。
- 護照單字與例句：© 南投縣草屯鎮土城國小（《土城國小英語護照》）。
- 發音檔：各自依 Commons 原授權（CC BY-SA 3.0 或公眾領域），錄音者見 credits。
- 圖示 Twemoji（CC BY 4.0）、字型 Fredoka（OFL 1.1）、jsQR（Apache-2.0）、qrcode-generator（MIT）。

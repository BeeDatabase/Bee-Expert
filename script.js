/********************

 * 共用工具

 ********************/

// --- 格式化日期 (年/月/日) ---

function formatDate(date) {

  if (!date || isNaN(date.getTime())) {

      return "---";

  }

  const year = date.getFullYear();

  const month = date.getMonth() + 1; // getMonth() 回傳 0-11

  const day = date.getDate();

  return `${year}年${month}月${day}日`;

}

// --- 格式化日期 (僅 月/日) ---

function formatMonthDay(date) {

  if (!date || isNaN(date.getTime())) {

      return "---";

  }

  const month = date.getMonth() + 1;

  const day = date.getDate();

  return `${month}/${day}`;

}

// --- 取得日期並檢查 ---

function getAndCheckDate(id, alertMsg) {

  const input = document.getElementById(id).value;

  const date = new Date(input);

  if (!input || isNaN(date.getTime())) {

    if (alertMsg) alert(alertMsg); // 僅在需要時才彈出警告

    return null;

  }

  // 修正時區問題，確保日期不會因為 UTC 轉換而-1天

  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

  return date;

}

// --- 計算日期並顯示 ---

function calcAndShow(baseDate, daysOffset, elementId) {

  const resultDate = new Date(baseDate);

  resultDate.setDate(baseDate.getDate() + daysOffset);

  document.getElementById(elementId).innerText = formatDate(resultDate);

}

// --- 取得數字並檢查 ---

function getAndCheckNumber(id, alertMsg, allowZero = false) {

  const value = parseFloat(document.getElementById(id).value);

  if (isNaN(value) || value < 0 || (!allowZero && value === 0)) {

    if (alertMsg) alert(alertMsg);

    return null;

  }

  return value;

}

// --- 顯示結果 (數字) ---

function setResult(id, value, precision = 1) {

  document.getElementById(id).innerText = value.toFixed(precision);

}

// --- 格式化為貨幣 (台幣) ---

const currency = (val) => val.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });

// --- 附加到 Log ---

function appendToLog(logId, entry) {

  const logOutput = document.getElementById(logId);

  logOutput.value += entry; // 使用 += 來附加新紀錄

  logOutput.scrollTop = logOutput.scrollHeight; // 自動滾動到最下方

}

/********************

 * (一) 婚飛交尾日期

 ********************/

function calculateMatingPlanner() {

  const targetDate = getAndCheckDate('targetMatingDate', '請選擇「目標交尾日期」！');

  if (!targetDate) return;

  

  calcAndShow(targetDate, -23, 'queenStartDate'); // 蜂王 -23天

  calcAndShow(targetDate, -38, 'droneStartDate'); // 雄蜂 -38天

}

/********************

 * (二) 蜂王培育批次管理

 ********************/

function calculateRearingBatch() {

  const graftDate = getAndCheckDate('graftingDate', '請選擇「移蟲日」！');

  if (!graftDate) return;

  

  document.getElementById('graftDate').innerText = formatDate(graftDate);

  calcAndShow(graftDate, 1, 'acceptDate');     // 第 1 天

  calcAndShow(graftDate, 5, 'cappingDate');    // 第 5 天

  calcAndShow(graftDate, 10, 'prepNucDate');   // 第 10 天

  calcAndShow(graftDate, 12, 'moveCellDate');  // 第 12 天

  calcAndShow(graftDate, 14, 'emergenceDate'); // 第 14 天

  calcAndShow(graftDate, 19, 'matingDate');    // 第 19 天

  calcAndShow(graftDate, 22, 'layingDate');    // 第 22 天

}

/********************

 * (三) Varroa 治療期

 ********************/

function calculateVarroa() {

  const cagingDate = getAndCheckDate('cagingDate', '請選擇「關王/無王開始日」！');

  if (!cagingDate) return;

  calcAndShow(cagingDate, 21, 'workerEmergenceDate'); // 工蜂 +21

  // v8.2 Bug 修復： 移除 ' droneEmergenceDate' 前面的空格

  calcAndShow(cagingDate, 24, 'droneEmergenceDate');  // 雄蜂 +24

}

/********************

 * (四) 分蜂/Nuc計畫

 ********************/

function calculateSwarm() {

  const swarmDate = getAndCheckDate('targetSwarmDate', '請選擇「預計分蜂日期」！');

  if (!swarmDate) return;

  calcAndShow(swarmDate, -10, 'graftForCellDate');   // 需成熟王台 -10

  calcAndShow(swarmDate, -12, 'graftForVirginDate'); // 需處女王 -12

}

/********************

 * (五) 流蜜期與獎勵飼餵

 ********************/

function calculateHoneyFlow() {

  const flowDate = getAndCheckDate('honeyFlowDate', '請選擇「預估流蜜期開始日」！');

  if (!flowDate) return;

  calcAndShow(flowDate, -28, 'startFeedingDate'); // 獎勵飼餵 -28 (4週)

  calcAndShow(flowDate, -14, 'removeMedsDate');   // 停藥 -14 (2週)

}

/********************

 * (六-A) 糖水(液體)混合計算機

 ********************/

function calculateSyrup() {

  const ratio = document.getElementById('syrupRatio').value;

  const totalVolume = getAndCheckNumber('totalVolume', '請輸入有效的總公升數！');

  if (totalVolume === null) return;

  let sugarKg, waterL;

  

  switch (ratio) {

      case '1:2': // 1kg糖(0.63L) + 2L水 = 3kg / 2.63L = 1.1407 kg/L

          sugarKg = totalVolume * (1.1407 * (1/3)); // 0.380

          waterL = totalVolume * (1.1407 * (2/3)); // 0.760

          break;

      case '1:1': // 1kg糖(0.63L) + 1L水 = 2kg / 1.63L = 1.227 kg/L

          sugarKg = totalVolume * (1.227 * (1/2)); // 0.6135

          waterL = totalVolume * (1.227 * (1/2)); // 0.6135

          break;

      case '1.5:1': // 1.5kg糖(0.945L) + 1L水 = 2.5kg / 1.945L = 1.285 kg/L

          sugarKg = totalVolume * (1.285 * (1.5/2.5)); // 0.771

          waterL = totalVolume * (1.285 * (1/2.5));   // 0.514

          break;

      case '2:1': // 2kg糖(1.26L) + 1L水 = 3kg / 2.26L = 1.327 kg/L

          sugarKg = totalVolume * (1.327 * (2/3)); // 0.885

          waterL = totalVolume * (1.327 * (1/3)); // 0.442

          break;

  }

  

  setResult('sugarKg', sugarKg, 1);

  setResult('waterL', waterL, 1);

}

/********************

 * (六-B) 糖水(固體)混合計算機

 ********************/

function calculateSolidFeed() {

  const ratio = document.getElementById('solidRatio').value;

  const totalWeight = getAndCheckNumber('totalWeight', '請輸入有效的總公斤數！');

  if (totalWeight === null) return;

  let sugarKg = 0, waterL = 0, pollenKg = 0;

  let note = "";

  const liquidLabel = document.getElementById('solidLiquidLabel'); // 獲取標籤元素

  switch (ratio) {

      case 'fondant_5_1': // 5:1 糖:水 (重量比)

          sugarKg = totalWeight * (5 / 6);

          waterL = totalWeight * (1 / 6);

          pollenKg = 0;

          liquidLabel.innerText = "水"; // 將標籤設回 "水"

          note = "(註：此為 5:1 蜂糖 (Fondant) 比例)";

          break;

      case 'pollen_2_1': // 2:1 糖:花粉 (重量比)

          sugarKg = totalWeight * (2 / 3);

          pollenKg = totalWeight * (1 / 3);

          waterL = 0; // 2:1 比例是乾料

          liquidLabel.innerText = "蜂蜜/糖水"; // v8.1 修改：將標籤改為 "蜂蜜/糖水"

          note = "(註：此為 2:1 糖:花粉 乾料比例。蜂蜜/糖水需額外添加調和，此處顯示為 0。)"; // v8.1 修改：更新備註

          break;

  }

  setResult('solidSugarKg', sugarKg, 2);

  setResult('solidWaterL', waterL, 2); // 這裡顯示 0.00

  setResult('solidPollenKg', pollenKg, 2);

  document.getElementById('solidNote').innerText = note;

}

/********************

 * (七) 蜂場工作清單

 ********************/

function generateToDoList() {

  const taskDate = getAndCheckDate('taskDate', '請選擇「工作日期」！');

  if (!taskDate) return;

  const hiveNumbers = document.getElementById('hiveNumbers').value.trim();

  if (!hiveNumbers) {

      alert("請輸入「蜂箱編號」！");

      return;

  }

  let selectedTasks = [];

  document.querySelectorAll('#taskCheckboxes input[type="checkbox"]:checked').forEach(function(checkbox) {

      selectedTasks.push(checkbox.value);

  });

  const otherTask = document.getElementById('otherTask').value.trim();

  if (otherTask) {

      selectedTasks.push(otherTask);

  }

  if (selectedTasks.length === 0) {

      alert("請至少選擇一項「工作項目」或填寫「其他項目」！");

      return;

  }

  const formattedDate = formatDate(taskDate);

  // 產生清單

  let output = `[${formattedDate} - 蜂場工作清單]\n\n`;

  output += `蜂箱範圍：${hiveNumbers}\n`;

  output += `--------------------\n`;

  output += `工作項目：\n`;

  

  selectedTasks.forEach(function(task) {

      output += `[ ] ${task}\n`;

  });

  document.getElementById('toDoListOutput').value = output;

}

/********************

 * (八) 蜂蜜採收與利潤

 ********************/

function calculateProfit() {

  const boxes = getAndCheckNumber('harvestBoxes', '請輸入有效的「採收箱數」！');

  const avgKg = getAndCheckNumber('avgKgPerBox', '請輸入有效的「平均採收公斤數」！');

  const price = getAndCheckNumber('pricePerKg', '請輸入有效的「蜂蜜售價」！', true); // 允許0

  const cost = getAndCheckNumber('costPerBox', '請輸入有效的「平均成本」！', true); // 允許0

  if (boxes === null || avgKg === null || price === null || cost === null) return;

  const totalHarvest = boxes * avgKg;

  const totalRevenue = totalHarvest * price;

  const totalCost = boxes * cost;

  const netProfit = totalRevenue - totalCost;

  const profitPerBox = (boxes > 0) ? netProfit / boxes : 0;

  document.getElementById('totalHarvest').innerText = totalHarvest.toFixed(1);

  document.getElementById('totalRevenue').innerText = currency(totalRevenue);

  document.getElementById('totalCost').innerText = currency(totalCost);

  document.getElementById('netProfit').innerText = currency(netProfit);

  document.getElementById('profitPerBox').innerText = currency(profitPerBox);

}

/********************

 * (九) 蜂場用藥紀錄

 ********************/

function logMedication() {

  const medDate = getAndCheckDate('medicationDate', '請選擇「用藥日期」！');

  if (!medDate) return;

  const medHives = document.getElementById('medicationHives').value.trim() || '未指定';

  const medName = document.getElementById('medicationName').value.trim();

  const medDosage = document.getElementById('medicationDosage').value.trim() || '未註明';

  const medNotes = document.getElementById('medicationNotes').value.trim() || '無';

  if (!medName) {

      alert("請輸入「藥品名稱」！");

      return;

  }

  const formattedDate = formatDate(medDate);

  let logEntry = `[${formattedDate}] - ${medName}\n`;

  logEntry += `  > 蜂箱: ${medHives}\n`;

  logEntry += `  > 劑量: ${medDosage}\n`;

  logEntry += `  > 備註: ${medNotes}\n`;

  logEntry += `------------------------------------\n`;

  appendToLog('medicationLogOutput', logEntry);

}

/********************

 * (十) 蜂王標記顏色

 ********************/

function highlightCurrentYearColor() {

  const currentYear = new Date().getFullYear();

  const lastDigit = currentYear % 10;

  let colorId = '';

  if (lastDigit === 0 || lastDigit === 5) colorId = 'color-blue';

  else if (lastDigit === 1 || lastDigit === 6) colorId = 'color-white';

  else if (lastDigit === 2 || lastDigit === 7) colorId = 'color-yellow';

  else if (lastDigit === 3 || lastDigit === 8) colorId = 'color-red';

  else if (lastDigit === 4 || lastDigit === 9) colorId = 'color-green';

  

  if (colorId) {

      document.getElementById(colorId).classList.add('current-year-color');

  }

}

/********************

 * (十一) 蜂箱檢查日誌

 ********************/

function logInspection() {

  const inspDate = getAndCheckDate('inspectionDate', '請選擇「檢查日期」！');

  if (!inspDate) return;

  const inspHives = document.getElementById('inspectionHives').value.trim();

  if (!inspHives) {

      alert("請輸入「蜂箱編號」！");

      return;

  }

  // 收集狀態

  let queenStatus = [];

  if (document.getElementById('queenSeen').checked) queenStatus.push("見王");

  if (document.getElementById('eggsSeen').checked) queenStatus.push("見卵");

  if (document.getElementById('larvaSeen').checked) queenStatus.push("見幼蟲");

  if (document.getElementById('queenMissing').checked) queenStatus.push("缺王");

  if (document.getElementById('queenCell').checked) queenStatus.push("有王台");

  let pests = [];

  if (document.getElementById('pestVarroa').checked) pests.push("蜂蟹蟎(高)");

  if (document.getElementById('pestWaxMoth').checked) pests.push("巢蟲");

  if (document.getElementById('pestDisease').checked) pests.push("幼蟲病(疑)");

  let actions = [];

  if (document.getElementById('actionAddFrame').checked) actions.push("加脾");

  if (document.getElementById('actionRemoveFrame').checked) actions.push("抽脾");

  if (document.getElementById('actionFeed').checked) actions.push("餵食");

  if (document.getElementById('actionDestroyCell').checked) actions.push("介入王台");

  const broodFrames = document.getElementById('inspectionBroodFrames').value.trim() || 'N/A';

  const inspNotes = document.getElementById('inspectionNotes').value.trim() || '無';

  const formattedDate = formatDate(inspDate);

  let logEntry = `[${formattedDate}] - ${inspHives}\n`;

  logEntry += `  > 蜂王狀態: ${queenStatus.length > 0 ? queenStatus.join(', ') : '未檢查'}\n`;

  logEntry += `  > 巢脾總數: ${broodFrames} 框\n`;

  logEntry += `  > 病蟲害: ${pests.length > 0 ? pests.join(', ') : '正常'}\n`;

  logEntry += `  > 處理動作: ${actions.length > 0 ? actions.join(', ') : '無'}\n`;

  logEntry += `  > 備註: ${inspNotes}\n`;

  logEntry += `------------------------------------\n`;

  appendToLog('inspectionLogOutput', logEntry);

  

  // 清空核取方塊

  document.querySelectorAll('.check-group input[type="checkbox"]').forEach(cb => cb.checked = false);

}

/********************

 * (十二) 蜂王狀態與譜系追蹤

 ********************/

function logQueen() {

  const queenId = document.getElementById('queenId').value.trim();

  if (!queenId) {

      alert("請輸入「蜂王編號」！");

      return;

  }

  

  const source = document.getElementById('queenSource').value.trim() || '未註明';

  const status = document.getElementById('queenStatus').value;

  const notes = document.getElementById('queenNotes').value.trim() || '無';

  

  // 獲取日期 (允許為空)

  const hatchDate = getAndCheckDate('queenHatchDate');

  const mateDate = getAndCheckDate('queenMateDate');

  const layDate = getAndCheckDate('queenLayDate');

  const logDate = formatDate(new Date()); // 紀錄當下的日期

  let logEntry = `[${logDate}] - 蜂王: ${queenId}\n`;

  logEntry += `  > 狀態: ${status}\n`;

  logEntry += `  > 來源: ${source}\n`;

  logEntry += `  > 出台日: ${hatchDate ? formatMonthDay(hatchDate) : 'N/A'}\n`;

  logEntry += `  > 婚飛日: ${mateDate ? formatMonthDay(mateDate) : 'N/A'}\n`;

  logEntry += `  > 產卵日: ${layDate ? formatMonthDay(layDate) : 'N/A'}\n`;

  logEntry += `  > 備註: ${notes}\n`;

  logEntry += `====================================\n`;

  

  appendToLog('queenLogOutput', logEntry);

}

/********************

 * (十三) 蜂場地點管理

 ********************/

function logApiaryMove() {

  const moveDate = getAndCheckDate('moveDate', '請選擇「移動日期」！');

  if (!moveDate) return;

  

  const hives = document.getElementById('moveHives').value.trim();

  const from = document.getElementById('moveFrom').value.trim();

  const to = document.getElementById('moveTo').value.trim();

  const reason = document.getElementById('moveReason').value.trim() || '未註明';

  if (!hives || !from || !to) {

      alert("請填寫「蜂箱編號」、「移出地」和「移入地」！");

      return;

  }

  

  let logEntry = `[${formatDate(moveDate)}] - ${reason}\n`;

  logEntry += `  > 蜂箱: ${hives}\n`;

  logEntry += `  > 路線: ${from}  ==>  ${to}\n`;

  logEntry += `------------------------------------\n`;

  

  appendToLog('apiaryLogOutput', logEntry);

}

/********************

 * (十四-A) 實際採收日誌

 ********************/

function logHarvest() {

  const harvestDate = getAndCheckDate('harvestLogDate', '請選擇「採收日期」！');

  if (!harvestDate) return;

  

  const source = document.getElementById('harvestLogSource').value.trim();

  const kg = getAndCheckNumber('harvestLogKg', '請輸入「總公斤」！');

  const price = getAndCheckNumber('harvestLogPrice', '請輸入「銷售單價」！', true); // 允許0

  const notes = document.getElementById('harvestLogNotes').value.trim() || '無';

  

  if (!source || kg === null || price === null) return;

  

  const totalRevenue = kg * price;

  

  let logEntry = `[${formatDate(harvestDate)}] - ${source}\n`;

  logEntry += `  > 數量: ${kg.toFixed(1)} kg\n`;

  logEntry += `  > 單價: ${currency(price)} /kg\n`;

  logEntry += `  > 總額: ${currency(totalRevenue)}\n`;

  logEntry += `  > 備註: ${notes}\n`;

  logEntry += `------------------------------------\n`;

  

  appendToLog('harvestLogOutput', logEntry);

}

/********************

 * (十四-B) 營運費用日誌

 ********************/

function logExpense() {

  const expenseDate = getAndCheckDate('expenseLogDate', '請選擇「費用日期」！');

  if (!expenseDate) return;

  

  const item = document.getElementById('expenseLogItem').value.trim();

  const amount = getAndCheckNumber('expenseLogAmount', '請輸入「總金額」！');

  const notes = document.getElementById('expenseLogNotes').value.trim() || '無';

  

  if (!item || amount === null) return;

  

  let logEntry = `[${formatDate(expenseDate)}] - ${item}\n`;

  logEntry += `  > 金額: ${currency(amount)}\n`;

  logEntry += `  > 備註: ${notes}\n`;

  logEntry += `------------------------------------\n`;

  

  appendToLog('expenseLogOutput', logEntry);

}

/********************

 * 頁面載入時執行

 * (v8.2: 綁定所有事件監聽)

 ********************/

window.onload = function() {

  

  // 自動填入今天的日期

  const today = new Date().toISOString().split('T')[0];

  const dateInputs = [

      'taskDate', 'medicationDate', 'inspectionDate', 'moveDate', 

      'harvestLogDate', 'expenseLogDate', 'queenHatchDate', 

      'queenMateDate', 'queenLayDate'

  ];

  dateInputs.forEach(id => {

      const el = document.getElementById(id);

      if (el && !el.value) { 

           el.value = today;

      }

  });

  

  // 自動標示當年的蜂王顏色

  highlightCurrentYearColor();

  // --- v8.2 新增：綁定所有按鈕事件 ---

  document.getElementById('btnMatingPlanner').addEventListener('click', calculateMatingPlanner);

  document.getElementById('btnRearingBatch').addEventListener('click', calculateRearingBatch);

  document.getElementById('btnVarroa').addEventListener('click', calculateVarroa);

  document.getElementById('btnSwarm').addEventListener('click', calculateSwarm);

  document.getElementById('btnHoneyFlow').addEventListener('click', calculateHoneyFlow);

  document.getElementById('btnSyrup').addEventListener('click', calculateSyrup);

  document.getElementById('btnSolidFeed').addEventListener('click', calculateSolidFeed);

  document.getElementById('btnToDoList').addEventListener('click', generateToDoList);

  document.getElementById('btnProfit').addEventListener('click', calculateProfit);

  document.getElementById('btnLogMedication').addEventListener('click', logMedication);

  document.getElementById('btnLogInspection').addEventListener('click', logInspection);

  document.getElementById('btnLogQueen').addEventListener('click', logQueen);

  document.getElementById('btnLogApiaryMove').addEventListener('click', logApiaryMove);

  document.getElementById('btnLogHarvest').addEventListener('click', logHarvest);

  document.getElementById('btnLogExpense').addEventListener('click', logExpense);

  

  // 確保固體飼料的標籤在選項變更時也會更新

  document.getElementById('solidRatio').addEventListener('change', calculateSolidFeed);

};

// ==========================================
// 新增功能 1: 自動標示蜂王顏色 (架構師優化版)
// ==========================================
function highlightQueenColor() {
    const currentYear = new Date().getFullYear();
    const yearDigit = currentYear % 10; // 取得年份最後一位 (例如 2025 -> 5)
    
    // 顯示年份文字
    const yearText = document.getElementById('currentYearText');
    if (yearText) {
        yearText.innerText = `${currentYear} 年`;
    }

    // 顏色定義 (尾數對應顏色ID)
    // 0,5=Blue | 1,6=White | 2,7=Yellow | 3,8=Red | 4,9=Green
    const colorMap = {
        0: 'color-blue', 5: 'color-blue',
        1: 'color-white', 6: 'color-white',
        2: 'color-yellow', 7: 'color-yellow',
        3: 'color-red', 8: 'color-red',
        4: 'color-green', 9: 'color-green'
    };

    const activeColorId = colorMap[yearDigit];
    const activeElement = document.getElementById(activeColorId);

    if (activeElement) {
        // 添加「今年」的樣式類別
        activeElement.classList.add('current-year-color');
        activeElement.innerHTML += '<br><strong>(今年)</strong>';
    }
}

// 執行蜂王顏色標示
highlightQueenColor();


// ==========================================
// 新增功能 2: 一鍵複製功能
// ==========================================
function copyToClipboard(elementId) {
    const copyText = document.getElementById(elementId);
    
    if (!copyText || copyText.value.trim() === "") {
        alert("目前沒有內容可以複製喔！");
        return;
    }

    // 選擇文字
    copyText.select();
    copyText.setSelectionRange(0, 99999); // 支援手機版選取

    // 執行複製
    navigator.clipboard.writeText(copyText.value).then(() => {
        alert("✅ 已複製內容到剪貼簿！\n您可以直接去 LINE 貼上了。");
    }).catch(err => {
        console.error('複製失敗: ', err);
        alert("複製失敗，請手動選取複製。");
    });
}

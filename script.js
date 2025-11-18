// ==========================================
// 蜂場專家 V3.6 - 完整功能版
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("蜂場專家系統啟動...");
    
    // 1. 載入分頁
    var savedTab = localStorage.getItem('bee_active_tab') || 'tab-home';
    switchTab(savedTab);
    
    // 2. 初始化首頁
    updateHeroInfo();
    renderQueenColor();
    
    // 3. 綁定所有按鈕 (包含原本遺失的功能)
    bindAllEvents();
});

// --- 分頁切換 ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-section').forEach(function(el) { el.classList.remove('active'); });
    var target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(function(btn) { btn.classList.remove('active'); });
    var activeBtns = document.querySelectorAll('[onclick*="' + tabId + '"]');
    activeBtns.forEach(function(btn) { btn.classList.add('active'); });
    
    localStorage.setItem('bee_active_tab', tabId);
}

// --- 首頁資訊更新 ---
function updateHeroInfo() {
    var now = new Date();
    var dateStr = (now.getMonth() + 1) + "月" + now.getDate() + "日";
    var elDate = document.getElementById('heroDate');
    if(elDate) elDate.innerText = now.getFullYear() + "年 " + dateStr;
    
    // 模擬天氣
    document.getElementById('heroWeatherDesc').innerText = "晴時多雲";
    document.getElementById('heroTemp').innerText = "26°C";
    
    // 產量與待辦
    var yieldVal = localStorage.getItem('bee_hero_yield') || '0';
    var taskCount = localStorage.getItem('bee_task_count') || '0';
    document.getElementById('heroYield').innerText = yieldVal + " kg";
    document.getElementById('heroTaskCount').innerText = taskCount + " 項";
}

// --- 蜂王顏色 ---
function renderQueenColor() {
    var y = new Date().getFullYear() % 10;
    var colors = ['#2196F3', '#FFFFFF', '#FFEB3B', '#F44336', '#4CAF50', '#2196F3', '#FFFFFF', '#FFEB3B', '#F44336', '#4CAF50'];
    var box = document.getElementById('queenColorBox');
    if(box) { box.style.backgroundColor = colors[y]; box.title = "年份尾數: " + y; }
}

// --- 按鈕綁定與邏輯 (核心) ---
function bindAllEvents() {
    function safeBind(id, handler) {
        var btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    }
    
    // 1. 婚飛
    safeBind('btnCalcMating', function() {
        var d = getDate('inputMatingDate');
        if(d) {
            setText('resQueenDate', addDays(d, -23));
            setText('resDroneDate', addDays(d, -38));
        } else alert("請輸入日期");
    });

    // 2. 育王排程
    safeBind('btnRearingBatch', function() {
        var d = getDate('graftingDate');
        if(d) {
            setText('graftDate', addDays(d, 0));
            setText('cappingDate', addDays(d, 5));
            setText('moveCellDate', addDays(d, 11));
            setText('emergenceDate', addDays(d, 13));
        } else alert("請輸入移蟲日");
    });

    // 3. 蜂蟹蟎
    safeBind('btnVarroa', function() {
        var d = getDate('cagingDate');
        if(d) { setText('workerEmergenceDate', addDays(d, 21)); } else alert("請輸入關王日");
    });

    // 4. 分蜂
    safeBind('btnSwarm', function() {
        var d = getDate('targetSwarmDate');
        if(d) { setText('graftForCellDate', addDays(d, -12)); } else alert("請輸入預計分蜂日");
    });

    // 5. 流蜜期
    safeBind('btnHoneyFlow', function() {
        var d = getDate('honeyFlowDate');
        if(d) {
            setText('startFeedingDate', addDays(d, -28));
            setText('removeMedsDate', addDays(d, -14));
        } else alert("請輸入流蜜日");
    });

    // 6. 糖水
    safeBind('btnCalcSyrup', function() {
        var r = document.getElementById('inputSyrupRatio').value;
        var v = parseFloat(getVal('inputSyrupVol'));
        if(v) {
            var s = 0, w = 0;
            if(r === '1:1') { s = v/1.6; w = v/1.6; } else { s = v/2.2 * 2; w = v/2.2; }
            setText('resSugar', s.toFixed(1));
            setText('resWater', w.toFixed(1));
        }
    });

    // 8. 利潤
    safeBind('btnProfit', function() {
        var box = parseFloat(getVal('harvestBoxes')) || 0;
        var kg = parseFloat(getVal('avgKgPerBox')) || 0;
        var p = parseFloat(getVal('pricePerKg')) || 0;
        var c = parseFloat(getVal('costPerBox')) || 0;
        
        var rev = box * kg * p;
        var cost = box * c;
        var net = rev - cost;
        
        setText('totalRevenue', rev.toLocaleString());
        setText('totalCost', cost.toLocaleString());
        setText('netProfit', net.toLocaleString());
        
        // 儲存產量供首頁顯示
        var totalKg = box * kg;
        localStorage.setItem('bee_hero_yield', totalKg);
        document.getElementById('heroYield').innerText = totalKg + " kg";
        
        // 畫圖
        if(typeof Chart !== 'undefined') {
            var ctx = document.getElementById('profitChart');
            if(window.myChart) window.myChart.destroy();
            window.myChart = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: ['成本', '利潤'], datasets: [{ data: [cost, net], backgroundColor: ['#FF5722', '#4CAF50'] }] }
            });
        }
    });

    // 日誌紀錄 (共用邏輯)
    safeBind('btnSaveLog', function() { appendLog('outputLog', `📅 ${getVal('logDate')} | 箱:${getVal('logHive')} | 藥:${getVal('logDrug')} | 備:${getVal('logNote')}`); });
    safeBind('btnSaveIns', function() {
        var cks = [];
        if(document.getElementById('ckQueen').checked) cks.push("見王");
        if(document.getElementById('ckEggs').checked) cks.push("見卵");
        if(document.getElementById('ckCell').checked) cks.push("王台");
        appendLog('outputIns', `📅 ${getVal('insDate')} | 箱:${getVal('insHive')} | ${cks.join(',')} | 備:${getVal('insNote')}`);
    });
    safeBind('btnSaveQueen', function() { appendLog('outputQueen', `👑 ${getVal('queenId')} | 出台:${getVal('queenHatch')} | 狀態:${document.getElementById('queenStatus').value}`); });
    safeBind('btnSaveMove', function() { appendLog('outputMove', `🚚 ${getVal('moveDate')} | 從 ${getVal('moveFrom')} 到 ${getVal('moveTo')}`); });
    safeBind('btnSaveHarv', function() { appendLog('outputHarv', `🍯 ${getVal('harvDate')} | ${getVal('harvItem')} | ${getVal('harvKg')}kg`); });
    safeBind('btnSaveExp', function() { appendLog('outputExp', `💸 ${getVal('expItem')} | $${getVal('expCost')}`); });

    // 工作清單
    safeBind('btnGenTask', function() {
        var t = [];
        document.querySelectorAll('.task-list input:checked').forEach(function(c){ t.push(c.value); });
        var o = getVal('taskOther'); if(o) t.push(o);
        document.getElementById('outputTask').value = "✅ 待辦事項：\n" + t.join('\n');
        localStorage.setItem('bee_task_count', t.length);
        document.getElementById('heroTaskCount').innerText = t.length + " 項";
    });

    // 備份
    safeBind('btnExport', function() {
        var data = JSON.stringify(localStorage);
        var blob = new Blob([data], {type: "application/json"});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = "bee_backup.json";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    
    // 匯入
    var fileInput = document.getElementById('fileInput');
    if(fileInput) {
        fileInput.addEventListener('change', function(e) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var d = JSON.parse(e.target.result);
                Object.keys(d).forEach(function(k){ localStorage.setItem(k, d[k]); });
                alert("還原成功！"); location.reload();
            };
            reader.readAsText(e.target.files[0]);
        });
    }
    
    // 清空
    safeBind('btnClearAll', function() { if(confirm("確定清空？")) { localStorage.clear(); location.reload(); } });
}

// --- 工具函數 ---
function getDate(id) { var v = document.getElementById(id).value; return v ? new Date(v) : null; }
function getVal(id) { var e = document.getElementById(id); return e ? e.value : ''; }
function setText(id, t) { var e = document.getElementById(id); if(e) e.innerText = t; }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate()+n); return x.toISOString().split('T')[0]; }
function appendLog(id, txt) {
    var area = document.getElementById(id);
    if(area) { area.value += txt + '\n'; localStorage.setItem('bee_saved_'+id, area.value); }
}
function copyToClipboard(id) {
    var el = document.getElementById(id);
    el.select(); document.execCommand('copy'); alert("已複製");
}

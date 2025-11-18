// ==========================================
// 蜂場專家 V3.5 - 核心邏輯 (Verified Code)
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("蜂場專家系統啟動...");
    
    // 1. 載入上次停留的分頁
    var savedTab = localStorage.getItem('bee_active_tab') || 'tab-home';
    switchTab(savedTab);
    
    // 2. 更新首頁資訊
    updateHeroInfo();
    
    // 3. 綁定按鈕事件 (核心功能)
    bindAllEvents();
    
    // 4. 渲染蜂王顏色
    renderQueenColor();
});

// --- 1. 分頁切換系統 ---
function switchTab(tabId) {
    // 隱藏所有頁面
    document.querySelectorAll('.tab-section').forEach(function(el) {
        el.classList.remove('active');
    });
    
    // 顯示目標頁面
    var target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }
    
    // 更新底部導覽列狀態
    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // 簡單透過 onclick 屬性來匹配按鈕
    var activeBtns = document.querySelectorAll('[onclick*="' + tabId + '"]');
    activeBtns.forEach(function(btn) {
        btn.classList.add('active');
    });
    
    // 儲存狀態
    localStorage.setItem('bee_active_tab', tabId);
}

// --- 2. 更新首頁資訊 ---
function updateHeroInfo() {
    // 日期
    var now = new Date();
    var dateStr = (now.getMonth() + 1) + "月" + now.getDate() + "日";
    var elDate = document.getElementById('heroDate');
    if(elDate) elDate.innerText = now.getFullYear() + "年 " + dateStr;
    
    // 模擬天氣 (實際上可串接 API，這裡先寫死示範)
    // 若要真實天氣，需 HTTPS 環境與 API Key
    document.getElementById('heroWeatherDesc').innerText = "晴時多雲";
    document.getElementById('heroTemp').innerText = "26°C";
    
    // 讀取待辦事項數量 (模擬)
    var tasks = localStorage.getItem('bee_task_count') || '0';
    document.getElementById('heroTaskCount').innerText = tasks + " 項";
}

// --- 3. 蜂王顏色邏輯 ---
function renderQueenColor() {
    var year = new Date().getFullYear();
    var digit = year % 10; // 取尾數
    // 0,5藍 | 1,6白 | 2,7黃 | 3,8紅 | 4,9綠
    var colors = ['#2196F3', '#FFFFFF', '#FFEB3B', '#F44336', '#4CAF50', '#2196F3', '#FFFFFF', '#FFEB3B', '#F44336', '#4CAF50'];
    var box = document.getElementById('queenColorBox');
    if(box) {
        box.style.backgroundColor = colors[digit];
        box.title = "年份尾數: " + digit;
    }
}

// --- 4. 按鈕綁定與功能實作 (防呆版) ---
function bindAllEvents() {
    
    // Helper: 安全綁定
    function safeBind(id, handler) {
        var btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        } else {
            console.warn('按鈕未找到 (可能 HTML ID 不匹配): ' + id);
        }
    }

    // === 計算工具：婚飛 ===
    safeBind('btnCalcMating', function() {
        var inputDate = document.getElementById('inputMatingDate').value;
        if (!inputDate) { alert("請選擇日期！"); return; }
        
        var target = new Date(inputDate);
        var queenDate = new Date(target); queenDate.setDate(target.getDate() - 23);
        var droneDate = new Date(target); droneDate.setDate(target.getDate() - 38);
        
        document.getElementById('resQueenDate').innerText = queenDate.toISOString().split('T')[0];
        document.getElementById('resDroneDate').innerText = droneDate.toISOString().split('T')[0];
    });

    // === 計算工具：糖水 ===
    safeBind('btnCalcSyrup', function() {
        var ratio = document.getElementById('inputSyrupRatio').value;
        var vol = parseFloat(document.getElementById('inputSyrupVol').value);
        
        if (!vol) { alert("請輸入公升數！"); return; }
        
        var sugar = 0, water = 0;
        // 簡易體積估算 (1kg糖 溶解後約 0.6L)
        if (ratio === '1:1') {
            // 1kg糖 + 1kg水 = 1.6L
            var unit = vol / 1.6;
            sugar = unit; water = unit;
        } else {
            // 2kg糖 + 1kg水 = 2.2L
            var unit = vol / 2.2;
            sugar = unit * 2; water = unit;
        }
        
        document.getElementById('resSugar').innerText = sugar.toFixed(1);
        document.getElementById('resWater').innerText = water.toFixed(1);
    });

    // === 日誌紀錄：儲存 ===
    safeBind('btnSaveLog', function() {
        var date = document.getElementById('logDate').value;
        var hive = document.getElementById('logHive').value;
        var drug = document.getElementById('logDrug').value;
        var note = document.getElementById('logNote').value;
        
        if(!date || !hive) { alert("請填寫日期與箱號"); return; }
        
        var logLine = `📅 ${date} | 箱號: ${hive} | 💊 ${drug} | 備註: ${note}\n`;
        var textarea = document.getElementById('outputLog');
        textarea.value += logLine;
        
        // 存到 localStorage
        localStorage.setItem('bee_med_log', textarea.value);
        alert("紀錄已儲存！");
    });

    // === 日誌紀錄：複製 ===
    safeBind('btnCopyLog', function() {
        var textarea = document.getElementById('outputLog');
        textarea.select();
        document.execCommand('copy'); // 舊版相容寫法
        alert("✅ 已複製到剪貼簿");
    });
    
    // 頁面載入時，恢復日誌內容
    var savedLog = localStorage.getItem('bee_med_log');
    if(savedLog) document.getElementById('outputLog').value = savedLog;

    // === 工作清單：生成 ===
    safeBind('btnGenTask', function() {
        var tasks = [];
        // 抓取所有打勾的 checkbox
        var checks = document.querySelectorAll('.task-list input[type="checkbox"]:checked');
        checks.forEach(function(c) { tasks.push(c.value); });
        
        var other = document.getElementById('taskOther').value;
        if(other) tasks.push(other);
        
        var result = "✅ 今日工作清單：\n";
        tasks.forEach(function(t) { result += "- " + t + "\n"; });
        
        document.getElementById('outputTask').value = result;
        
        // 更新首頁待辦數字
        localStorage.setItem('bee_task_count', tasks.length);
        document.getElementById('heroTaskCount').innerText = tasks.length + " 項";
    });

    // === 設定：清空 ===
    safeBind('btnClearAll', function() {
        if(confirm("⚠️ 確定要清空所有紀錄嗎？此操作無法復原！")) {
            localStorage.clear();
            location.reload();
        }
    });
}

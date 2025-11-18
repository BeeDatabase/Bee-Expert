// ==========================================
// 1. 核心導覽系統 (Tabs Navigation)
// ==========================================
function switchTab(tabId) {
    console.log("切換分頁至:", tabId); // 除錯用

    // A. 隱藏所有分頁內容
    var sections = document.querySelectorAll('.tab-section');
    sections.forEach(function(section) {
        section.classList.remove('active');
    });

    // B. 顯示目標分頁
    var target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error("找不到分頁 ID:", tabId);
        return;
    }

    // C. 更新按鈕狀態 (電腦版 + 手機版)
    var allBtns = document.querySelectorAll('.nav-item, .nav-item-desktop');
    allBtns.forEach(function(btn) {
        btn.classList.remove('active');
    });

    // 根據點擊的 tabId 點亮對應按鈕 (使用簡單的屬性選擇器)
    // 尋找所有 onclick 包含該 tabId 的按鈕並加上 active
    // 這種寫法比較粗暴但有效
    var activeBtns = document.querySelectorAll('[onclick*="' + tabId + '"]');
    activeBtns.forEach(function(btn) {
        // 確保是導覽按鈕才加 active
        if (btn.classList.contains('nav-item') || btn.classList.contains('nav-item-desktop')) {
            btn.classList.add('active');
        }
    });

    // D. 儲存狀態
    localStorage.setItem('bee_active_tab', tabId);
}

// ==========================================
// 2. 摺疊選單系統 (Accordion)
// ==========================================
function setupAccordion() {
    var acc = document.getElementsByClassName("accordion");
    for (var i = 0; i < acc.length; i++) {
        // 移除舊的事件監聽器 (防止重複綁定)
        var newElement = acc[i].cloneNode(true);
        acc[i].parentNode.replaceChild(newElement, acc[i]);
        
        // 綁定新事件
        newElement.addEventListener("click", function() {
            this.classList.toggle("active-accordion");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
    // 重新抓取 acc 變數 (因為用了 replaceChild)
    acc = document.getElementsByClassName("accordion");
}

// ==========================================
// 3. 初始化 (網頁載入後執行)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("網站初始化開始...");

    // 1. 恢復上次分頁
    var savedTab = localStorage.getItem('bee_active_tab');
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab);
    } else {
        switchTab('tab-home');
    }

    // 2. 初始化介面元件
    setupAccordion();
    updateDashboardDate();
    renderQueenColors();
    setupAutoSave(); // 啟動自動儲存

    // 3. 綁定所有計算按鈕 (直接綁定，不依賴封裝函數)
    bindAllButtons();
});

// ==========================================
// 4. 按鈕綁定與計算邏輯 (直接寫法)
// ==========================================
function bindAllButtons() {
    
    // Helper: 安全綁定函數
    function safeBind(id, handler) {
        var btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        } else {
            console.warn("警告：找不到按鈕 ID:", id);
        }
    }

    // (一) 婚飛反推
    safeBind('btnMatingPlanner', function() {
        var d = getDate('targetMatingDate');
        if(d) {
            setText('queenStartDate', addDays(d, -23));
            setText('droneStartDate', addDays(d, -38));
        } else { alert("請輸入日期！"); }
    });

    // (二) 育王排程
    safeBind('btnRearingBatch', function() {
        var d = getDate('graftingDate');
        if(d) {
            setText('graftDate', addDays(d, 0));
            setText('cappingDate', addDays(d, 5));
            setText('moveCellDate', addDays(d, 11));
            setText('emergenceDate', addDays(d, 13));
            setText('layingDate', addDays(d, 22));
        } else { alert("請輸入移蟲日！"); }
    });

    // (三) 蜂蟹蟎
    safeBind('btnVarroa', function() {
        var d = getDate('cagingDate');
        if(d) {
            setText('workerEmergenceDate', addDays(d, 21));
        } else { alert("請輸入關王日！"); }
    });

    // (四) 糖水計算
    safeBind('btnSyrup', function() {
        var ratio = document.getElementById('syrupRatio').value;
        var total = parseFloat(document.getElementById('totalVolume').value);
        if(total) {
            var sugar = 0, water = 0;
            if(ratio === '1:1') { 
                var units = total / 1.625; sugar = units; water = units;
            } else if (ratio === '2:1') {
                var units = total / 2.25; sugar = units * 2; water = units;
            } else {
                 // 簡易處理其他比例
                 sugar = total * 0.6; water = total * 0.6; 
            }
            setText('sugarKg', sugar.toFixed(1));
            setText('waterL', water.toFixed(1));
        }
    });

    // 固體飼料
    safeBind('btnSolidFeed', function() {
        var total = parseFloat(document.getElementById('totalWeight').value);
        if(total) {
            // 簡單估算 5:1
            var sugar = (total / 6) * 5;
            var liquid = (total / 6) * 1;
            setText('solidSugarKg', sugar.toFixed(1));
            setText('solidWaterL', liquid.toFixed(1));
        }
    });

    // (五) 利潤
    safeBind('btnProfit', function() {
        var boxes = parseFloat(getVal('harvestBoxes')) || 0;
        var kgBox = parseFloat(getVal('avgKgPerBox')) || 0;
        var price = parseFloat(getVal('pricePerKg')) || 0;
        var cost = parseFloat(getVal('costPerBox')) || 0;

        var totalRev = boxes * kgBox * price;
        var totalCost = boxes * cost;
        var net = totalRev - totalCost;
        var perBox = boxes > 0 ? net / boxes : 0;

        setText('netProfit', Math.round(net).toLocaleString());
        setText('profitPerBox', Math.round(perBox).toLocaleString());
        setText('totalRevenue', Math.round(totalRev).toLocaleString());
        setText('totalCost', Math.round(totalCost).toLocaleString());
    });

    // (九) 用藥紀錄生成
    safeBind('btnLogMedication', function() {
        var date = getVal('medicationDate');
        var hives = getVal('medicationHives');
        var name = getVal('medicationName');
        var dose = getVal('medicationDosage');
        var note = getVal('medicationNotes');
        var log = `📅 日期: ${date}\n🐝 箱號: ${hives}\n💊 藥品: ${name}\n💉 劑量: ${dose}\n📝 備註: ${note}`;
        document.getElementById('medicationLogOutput').value = log;
    });

    // (十一) 檢查紀錄生成
    safeBind('btnLogInspection', function() {
        var date = getVal('inspectionDate');
        var hives = getVal('inspectionHives');
        var frames = getVal('inspectionBroodFrames');
        var notes = getVal('inspectionNotes');
        // Checkbox 收集
        var status = [];
        if(document.getElementById('queenSeen').checked) status.push("見王");
        if(document.getElementById('eggsSeen').checked) status.push("見卵");
        if(document.getElementById('queenCell').checked) status.push("王台");
        
        var log = `📅 日期: ${date}\n🐝 箱號: ${hives}\n👀 狀態: ${status.join(', ')}\n🪧 脾數: ${frames}\n📝 備註: ${notes}`;
        document.getElementById('inspectionLogOutput').value = log;
    });

    // 清空按鈕
    safeBind('btnClearLocalStorage', function() {
        if(confirm('⚠️ 確定要清空所有紀錄嗎？這無法復原！')) {
            localStorage.clear();
            alert('已清空，網頁將重新整理。');
            location.reload();
        }
    });
    
    // 工作清單生成
    safeBind('btnToDoList', function() {
        var date = getVal('taskDate');
        var hives = getVal('hiveNumbers');
        var tasks = [];
        var checkboxes = document.querySelectorAll('#tab-tasks input[type="checkbox"]');
        checkboxes.forEach(function(cb) {
            if(cb.checked) tasks.push(cb.value);
        });
        var other = getVal('otherTask');
        if(other) tasks.push(other);
        
        var log = `✅ 工作清單 [${date}]\n📦 箱號: ${hives}\n🔧 項目:\n- ${tasks.join('\n- ')}`;
        document.getElementById('toDoListOutput').value = log;
    });
}

// ==========================================
// 5. 輔助工具函數 (Utilities)
// ==========================================
function updateDashboardDate() {
    var now = new Date();
    var dateStr = (now.getMonth() + 1) + "月" + now.getDate() + "日";
    var el = document.getElementById('dashboardDate');
    if(el) el.innerText = dateStr;
    
    var elYear = document.getElementById('dashboardYearInfo');
    if(elYear) elYear.innerText = now.getFullYear() + " 年";
}

function renderQueenColors() {
    var year = new Date().getFullYear();
    var digit = year % 10;
    // 0,5藍 1,6白 2,7黃 3,8紅 4,9綠
    var colors = ['藍','白','黃','紅','綠','藍','白','黃','紅','綠'];
    var hexs = ['#2196f3','#ffffff','#ffeb3b','#f44336','#4caf50','#2196f3','#ffffff','#ffeb3b','#f44336','#4caf50'];
    
    var colorName = colors[digit];
    var colorHex = hexs[digit];
    
    var div = document.getElementById('home-queen-color');
    if(div) {
        div.innerHTML = `<div style="background:${colorHex}; width:50px; height:50px; border-radius:50%; border:3px solid #333; margin:0 auto; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#333; box-shadow:0 2px 5px rgba(0,0,0,0.2);">${colorName}</div>`;
    }
}

function setupAutoSave() {
    var inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(function(input) {
        if(!input.id) return;
        // 讀取
        var val = localStorage.getItem('bee_' + input.id);
        if(val) {
            if(input.type === 'checkbox') input.checked = (val === 'true');
            else input.value = val;
        }
        // 儲存
        input.addEventListener('change', function() {
            var v = (this.type === 'checkbox') ? this.checked : this.value;
            localStorage.setItem('bee_' + this.id, v);
        });
    });
}

function copyToClipboard(id) {
    var el = document.getElementById(id);
    if(!el) return;
    el.select();
    el.setSelectionRange(0, 99999); // 手機兼容
    navigator.clipboard.writeText(el.value).then(function() {
        alert('✅ 已複製到剪貼簿');
    }, function() {
        alert('❌ 複製失敗，請手動複製');
    });
}

// 簡化版日期處理
function getDate(id) {
    var val = document.getElementById(id).value;
    return val ? new Date(val) : null;
}
function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
}
function setText(id, txt) {
    var el = document.getElementById(id);
    if(el) el.innerText = txt;
}
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

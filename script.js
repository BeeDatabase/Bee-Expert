// ==========================================
// Bee Expert V3.0 - 修正版 JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("系統啟動中...");
    
    // 1. 恢復分頁狀態
    var savedTab = localStorage.getItem('bee_active_tab') || 'tab-home';
    switchTab(savedTab);
    
    // 2. 初始化核心功能
    setupAccordion();
    setupAutoSave();
    renderQueenColors();
    updateDashboardDate();
    
    // 3. 啟動新功能
    initTheme();       // 深色模式
    initFarmName();    // 自訂標題
    initWeather();     // 真實天氣
    
    // 4. 綁定所有按鈕
    bindAllButtons();
});

// --- 核心功能：分頁切換 ---
function switchTab(tabId) {
    // 隱藏所有分頁
    var sections = document.querySelectorAll('.tab-section');
    sections.forEach(function(el) { el.classList.remove('active'); });
    
    // 顯示目標分頁
    var target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    
    // 更新底部導覽列按鈕
    var navs = document.querySelectorAll('.nav-item, .nav-item-desktop');
    navs.forEach(function(btn) { btn.classList.remove('active'); });
    
    // 簡單透過 onclick 屬性來判斷哪個按鈕該亮起
    var activeBtns = document.querySelectorAll('[onclick*="' + tabId + '"]');
    activeBtns.forEach(function(btn) { btn.classList.add('active'); });
    
    localStorage.setItem('bee_active_tab', tabId);
}

// --- 核心功能：摺疊選單 ---
function setupAccordion() {
    var acc = document.getElementsByClassName("accordion");
    for (var i = 0; i < acc.length; i++) {
        // 移除舊事件避免重複
        var newEl = acc[i].cloneNode(true);
        acc[i].parentNode.replaceChild(newEl, acc[i]);
        
        newEl.addEventListener("click", function() {
            this.classList.toggle("active-accordion");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
}

// --- 新功能：深色模式 ---
function initTheme() {
    var savedTheme = localStorage.getItem('bee_theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
    
    var btn = document.getElementById('btnThemeToggle');
    if(btn) {
        btn.addEventListener('click', function() {
            var current = document.body.getAttribute('data-theme');
            var newTheme = current === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('bee_theme', newTheme);
        });
    }
}

// --- 新功能：自訂標題 ---
function initFarmName() {
    var titleEl = document.getElementById('myFarmName');
    if(titleEl) {
        var savedName = localStorage.getItem('bee_farm_name');
        if (savedName) titleEl.innerText = savedName;

        titleEl.addEventListener('blur', function() {
            localStorage.setItem('bee_farm_name', this.innerText);
        });
    }
}

// --- 新功能：天氣 API ---
function initWeather() {
    // 預設先顯示載入中
    // 簡單使用 Open-Meteo API (以台中為例，避免 HTTPS 定位權限問題卡住)
    var url = "https://api.open-meteo.com/v1/forecast?latitude=24.14&longitude=120.68&current_weather=true";
    
    fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            var temp = data.current_weather.temperature;
            var el = document.getElementById('liveTemp');
            if(el) el.innerText = temp + "°C";
            
            var weatherEl = document.getElementById('liveWeather');
            if(weatherEl) weatherEl.innerText = "已更新";
        })
        .catch(function(err) {
            console.log("天氣載入失敗", err);
        });
}

// --- 新功能：語音輸入 ---
// 必須掛在 window 上才能被 HTML onclick 呼叫
window.startVoice = function(targetId) {
    if (!('webkitSpeechRecognition' in window)) {
        alert("您的瀏覽器不支援語音輸入 (請用 Chrome)");
        return;
    }
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.start();
    
    recognition.onresult = function(event) {
        var text = event.results[0][0].transcript;
        var el = document.getElementById(targetId);
        if(el) {
            el.value += text + " ";
            // 觸發儲存
            var event = new Event('change');
            el.dispatchEvent(event);
        }
    };
    recognition.onerror = function(e) { alert("語音辨識失敗，請重試"); };
};

// --- 核心功能：按鈕綁定 ---
function bindAllButtons() {
    function safeBind(id, handler) {
        var btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    }

    // 計時器
    var timerInterval;
    safeBind('btnStartTimer', function() {
        clearInterval(timerInterval);
        var minInput = document.getElementById('timerMinutes');
        var mins = minInput ? parseInt(minInput.value) : 10;
        var seconds = mins * 60;
        var display = document.getElementById('timerDisplay');
        
        timerInterval = setInterval(function() {
            var m = Math.floor(seconds / 60);
            var s = seconds % 60;
            if(display) display.innerText = m + ":" + (s < 10 ? '0'+s : s);
            if (seconds <= 0) {
                clearInterval(timerInterval);
                alert("⏳ 時間到！");
            }
            seconds--;
        }, 1000);
    });

    // Excel 匯出 (CSV)
    safeBind('btnExportCSV', function() {
        var csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Key,Value\n";
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if(key.startsWith('bee_')) {
                var val = localStorage.getItem(key).replace(/"/g, '""').replace(/\n/g, ' ');
                csvContent += key + ',"' + val + '"\n';
            }
        }
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bee_data.csv");
        document.body.appendChild(link);
        link.click();
    });

    // 計算功能 - 婚飛
    safeBind('btnMatingPlanner', function() {
        var d = getDate('targetMatingDate');
        if(d) { setText('queenStartDate', addDays(d, -23)); }
    });
    
    // 計算功能 - 育王
    safeBind('btnRearingBatch', function() {
        var d = getDate('graftingDate');
        if(d) {
            setText('graftDate', addDays(d, 0));
            setText('moveCellDate', addDays(d, 11));
            setText('emergenceDate', addDays(d, 13));
        }
    });

    // 計算功能 - 蜂蟹蟎
    safeBind('btnVarroa', function() {
        var d = getDate('cagingDate');
        if(d) { setText('workerEmergenceDate', addDays(d, 21)); }
    });

    // 計算功能 - 糖水
    safeBind('btnSyrup', function() {
        var total = parseFloat(getVal('totalVolume'));
        if(total) {
            // 簡單 1:1 估算
            setText('sugarKg', (total/1.6).toFixed(1));
            setText('waterL', (total/1.6).toFixed(1));
        }
    });

    // 計算功能 - 利潤 (含圖表)
    safeBind('btnProfit', function() {
        var rev = 50000; // 範例假資料，請改為真實讀取邏輯
        var cost = 20000;
        var net = rev - cost;
        setText('netProfit', net);
        
        if(typeof Chart !== 'undefined') {
            var ctx = document.getElementById('profitChart');
            if(ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['成本', '利潤'],
                        datasets: [{ data: [cost, net], backgroundColor: ['#e74c3c', '#27ae60'] }]
                    }
                });
            }
        }
    });
    
    // 日誌紀錄
    safeBind('btnLogMedication', function() { logToArea('medicationLogOutput', 'medication'); });
    safeBind('btnLogInspection', function() { logToArea('inspectionLogOutput', 'inspection'); });
    
    // 工作清單生成
    safeBind('btnToDoList', function() {
        var txt = "✅ 工作清單: \n";
        var checks = document.querySelectorAll('#tab-tasks input[type="checkbox"]:checked');
        checks.forEach(function(c){ txt += "- " + c.value + "\n"; });
        document.getElementById('toDoListOutput').value = txt;
    });
}

// --- 輔助函數 ---
function logToArea(areaId, prefix) {
    var date = getVal(prefix + 'Date');
    var note = getVal(prefix + 'Notes');
    var area = document.getElementById(areaId);
    if(area) {
        area.value += date + ": " + note + "\n";
        // 觸發自動儲存
        var event = new Event('change');
        area.dispatchEvent(event);
    }
}

function setupAutoSave() {
    var inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
        if(input.id) {
            var saved = localStorage.getItem('bee_' + input.id);
            if(saved) input.value = saved;
            
            input.addEventListener('change', function() {
                localStorage.setItem('bee_' + this.id, this.value);
            });
        }
    });
}

function updateDashboardDate() {
    var d = new Date();
    var el = document.getElementById('dashboardDate');
    if(el) el.innerText = (d.getMonth()+1) + "月" + d.getDate() + "日";
    
    var el2 = document.getElementById('dashboardYearInfo');
    if(el2) el2.innerText = d.getFullYear() + "年";
}

function renderQueenColors() {
    var y = new Date().getFullYear() % 10;
    var colors = ['藍','白','黃','紅','綠','藍','白','黃','紅','綠'];
    var hexs = ['#2196f3','#ffffff','#ffeb3b','#f44336','#4caf50','#2196f3','#ffffff','#ffeb3b','#f44336','#4caf50'];
    var el = document.getElementById('home-queen-color');
    if(el) {
        el.innerHTML = '<div style="width:40px;height:40px;border-radius:50%;background:'+hexs[y]+';border:2px solid #333;margin:0 auto;"></div>';
    }
}

function getDate(id) { var v = document.getElementById(id); return v && v.value ? new Date(v.value) : null; }
function getVal(id) { var v = document.getElementById(id); return v ? v.value : ''; }
function setText(id, t) { var v = document.getElementById(id); if(v) v.innerText = t; }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate()+n); return x.toISOString().split('T')[0]; }
function copyToClipboard(id) {
    var el = document.getElementById(id);
    if(el) {
        el.select();
        document.execCommand('copy');
        alert('已複製');
    }
}

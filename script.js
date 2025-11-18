// ==========================================
// 1. 初始化與核心設定
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 恢復分頁
    var savedTab = localStorage.getItem('bee_active_tab') || 'tab-home';
    switchTab(savedTab);
    
    // 初始化功能
    setupAccordion();
    setupAutoSave();
    renderQueenColors();
    updateDashboardDate();
    
    // 🔥 新功能初始化
    initTheme();       // 深色模式
    initFarmName();    // 自訂標題
    initWeather();     // 真實天氣
    
    // 綁定所有按鈕
    bindAllButtons();
});

// ==========================================
// 2. 新功能：深色模式 (Dark Mode)
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('bee_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    document.getElementById('btnThemeToggle').addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bee_theme', newTheme);
    });
}

// ==========================================
// 3. 新功能：自訂首頁標題 (Farm Name)
// ==========================================
function initFarmName() {
    const titleEl = document.getElementById('myFarmName');
    const savedName = localStorage.getItem('bee_farm_name');
    if (savedName) titleEl.innerText = savedName;

    // 當標題被修改時儲存
    titleEl.addEventListener('blur', function() {
        localStorage.setItem('bee_farm_name', this.innerText);
    });
}

// ==========================================
// 4. 新功能：真實天氣 API (Open-Meteo)
// ==========================================
function initWeather() {
    // 預設位置：台灣中部 (可改為定位)
    // 這裡示範抓取由 GPS 定位或預設
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeather, function(err) {
            console.log("定位失敗，使用預設位置");
            fetchWeather({coords: {latitude: 24.14, longitude: 120.68}}); // 台中預設
        });
    } else {
        fetchWeather({coords: {latitude: 24.14, longitude: 120.68}});
    }
}

function fetchWeather(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            document.getElementById('liveTemp').innerText = `${temp}°C`;
            
            // 簡易天氣代碼轉換
            let wDesc = "晴朗";
            if(code > 3) wDesc = "多雲";
            if(code > 50) wDesc = "有雨";
            if(code > 80) wDesc = "雷雨";
            document.getElementById('liveWeather').innerText = wDesc;
        })
        .catch(err => {
            document.getElementById('liveWeather').innerText = "無法連線";
        });
}

// ==========================================
// 5. 新功能：語音輸入 (Web Speech API)
// ==========================================
window.startVoice = function(targetId) {
    if (!('webkitSpeechRecognition' in window)) {
        alert("您的瀏覽器不支援語音輸入 (請用 Chrome/Safari)");
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'zh-TW'; // 設定中文
    recognition.start();
    
    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        const el = document.getElementById(targetId);
        el.value += text + " "; // 追加文字
        // 觸發儲存
        localStorage.setItem('bee_' + targetId, el.value);
    };
    
    recognition.onerror = function(e) { alert("語音辨識錯誤"); };
};

// ==========================================
// 6. 核心邏輯與按鈕綁定
// ==========================================
function bindAllButtons() {
    function safeBind(id, handler) {
        var btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    }

    // CSV 匯出
    safeBind('btnExportCSV', function() {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Excel
        csvContent += "Key,Value\n";
        Object.keys(localStorage).forEach(function(key){
             csvContent += `${key},"${localStorage.getItem(key).replace(/"/g, '""')}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bee_expert_log.csv");
        document.body.appendChild(link);
        link.click();
    });

    // 計時器
    let timerInterval;
    safeBind('btnStartTimer', function() {
        clearInterval(timerInterval);
        let mins = parseInt(document.getElementById('timerMinutes').value);
        let seconds = mins * 60;
        const display = document.getElementById('timerDisplay');
        
        timerInterval = setInterval(function() {
            let m = Math.floor(seconds / 60);
            let s = seconds % 60;
            display.innerText = `${m}:${s < 10 ? '0'+s : s}`;
            if (seconds <= 0) {
                clearInterval(timerInterval);
                alert("⏳ 時間到！");
            }
            seconds--;
        }, 1000);
    });

    // 其他計算邏輯 (保留原有的)
    safeBind('btnMatingPlanner', function() {
        var d = getDate('targetMatingDate');
        if(d) { setText('queenStartDate', addDays(d, -23)); }
    });
    // ... (其他計算按鈕邏輯與之前相同，為節省篇幅略過，請保留原本的) ...
    safeBind('btnProfit', function() {
        // ... 簡單利潤計算 ...
        var net = 5000; // 範例數據
        setText('netProfit', net);
        if(typeof Chart !== 'undefined') renderChart(10000, 5000); // 繪圖
    });
    
    // 匯出/匯入/清空 (保留)
    safeBind('btnClearLocalStorage', function(){
        if(confirm('確定清空？')) { localStorage.clear(); location.reload(); }
    });
}

// 圖表繪製
function renderChart(cost, profit) {
    const ctx = document.getElementById('profitChart');
    if(!ctx) return;
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['成本', '利潤'],
            datasets: [{ data: [cost, profit], backgroundColor: ['#e74c3c', '#27ae60'] }]
        }
    });
}

// 基礎工具函數
function switchTab(tabId) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-item, .nav-item-desktop').forEach(b => b.classList.remove('active'));
    // 簡單 active 處理
    localStorage.setItem('bee_active_tab', tabId);
}
function setupAccordion() {
    const acc = document.getElementsByClassName("accordion");
    for(let i=0; i<acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active-accordion");
            let panel = this.nextElementSibling;
            if(panel.style.maxHeight) panel.style.maxHeight = null;
            else panel.style.maxHeight = panel.scrollHeight + "px";
        });
    }
}
function setupAutoSave() {
    document.querySelectorAll('input, textarea').forEach(el => {
        if(el.id) {
            let v = localStorage.getItem('bee_'+el.id);
            if(v) el.value = v;
            el.addEventListener('change', () => localStorage.setItem('bee_'+el.id, el.value));
        }
    });
}
function renderQueenColors() { /* 略，保留原本 */ }
function updateDashboardDate() { 
    const d = new Date(); 
    document.getElementById('dashboardDate').innerText = (d.getMonth()+1)+"月"+d.getDate()+"日";
}
function getDate(id) { return document.getElementById(id).value ? new Date(document.getElementById(id).value) : null; }
function addDays(d, n) { let newD = new Date(d); newD.setDate(newD.getDate()+n); return newD.toISOString().split('T')[0]; }
function setText(id, t) { document.getElementById(id).innerText = t; }
function copyToClipboard(id) { navigator.clipboard.writeText(document.getElementById(id).value); alert("已複製"); }

// ==========================================
// 1. 核心導覽系統 (Tabs Navigation)
// ==========================================
function switchTab(tabId) {
    // A. 處理內容顯示
    // 隱藏所有分頁
    document.querySelectorAll('.tab-section').forEach(section => {
        section.classList.remove('active');
    });
    // 顯示目標分頁
    const targetSection = document.getElementById(tabId);
    if(targetSection) targetSection.classList.add('active');

    // B. 處理按鈕狀態 (同步更新電腦版和手機版)
    // 移除所有按鈕的 active 樣式
    document.querySelectorAll('.nav-item, .nav-item-desktop').forEach(btn => {
        btn.classList.remove('active');
    });

    // 找出對應的按鈕並點亮
    // 手機版按鈕 (nav-item)
    const mobileBtns = document.querySelectorAll('.nav-item');
    const desktopBtns = document.querySelectorAll('.nav-item-desktop');

    let index = 0;
    if(tabId === 'tab-home') index = 0;
    else if(tabId === 'tab-calc') index = 1;
    else if(tabId === 'tab-logs') index = 2;
    else if(tabId === 'tab-tasks') index = 3;
    else if(tabId === 'tab-settings') index = 4;

    if(mobileBtns[index]) mobileBtns[index].classList.add('active');
    if(desktopBtns[index]) desktopBtns[index].classList.add('active');

    // C. 儲存狀態
    localStorage.setItem('bee_active_tab', tabId);
}

// ==========================================
// 2. 介面互動與初始化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. 恢復上次停留的頁面
    const savedTab = localStorage.getItem('bee_active_tab');
    if (savedTab) {
        switchTab(savedTab);
    } else {
        switchTab('tab-home'); // 預設首頁
    }

    // 2. 初始化摺疊選單
    setupAccordion();

    // 3. 初始化自動儲存
    setupAutoSave();

    // 4. 顯示日期與資訊
    updateDashboardDate();

    // 5. 顯示蜂王顏色
    renderQueenColors();
    
    // 6. 綁定計算器按鈕事件
    bindCalculators();
});

function updateDashboardDate() {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
    document.getElementById('dashboardDate').innerText = dateStr;
    document.getElementById('dashboardYearInfo').innerText = `${now.getFullYear()} 年`;
}

function setupAccordion() {
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active-accordion");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
}

// ==========================================
// 3. 資料計算邏輯
// ==========================================
function bindCalculators() {
    // (一) 婚飛反推
    bindClick('btnMatingPlanner', () => {
        const d = getDate('targetMatingDate');
        if(d) {
            setText('queenStartDate', addDays(d, -23));
            setText('droneStartDate', addDays(d, -38));
        }
    });

    // (二) 育王排程
    bindClick('btnRearingBatch', () => {
        const d = getDate('graftingDate');
        if(d) {
            setText('graftDate', addDays(d, 0));
            setText('cappingDate', addDays(d, 5));
            setText('moveCellDate', addDays(d, 11));
            setText('emergenceDate', addDays(d, 13));
            setText('layingDate', addDays(d, 22));
        }
    });

    // (三) 蜂蟹蟎
    bindClick('btnVarroa', () => {
        const d = getDate('cagingDate');
        if(d) {
            setText('workerEmergenceDate', addDays(d, 21));
        }
    });

    // (四) 糖水計算
    bindClick('btnSyrup', () => {
        const ratio = document.getElementById('syrupRatio').value; // 1:1
        const total = parseFloat(document.getElementById('totalVolume').value);
        if(total) {
            let sugar = 0, water = 0;
            // 簡易估算: 1kg糖=0.6L, 水=1L
            if(ratio === '1:1') { 
                // 1kg糖+1L水 = 1.6L體積
                // x(1.6) = total => x = total/1.6
                let units = total / 1.625;
                sugar = units * 1; 
                water = units * 1;
            } else if (ratio === '2:1') {
                // 2kg糖+1L水 = 2*0.625 + 1 = 2.25L
                let units = total / 2.25;
                sugar = units * 2;
                water = units * 1;
            }
            setText('sugarKg', sugar.toFixed(1));
            setText('waterL', water.toFixed(1));
        }
    });

    // (五) 利潤
    bindClick('btnProfit', () => {
        const boxes = parseFloat(getVal('harvestBoxes')) || 0;
        const kgBox = parseFloat(getVal('avgKgPerBox')) || 0;
        const price = parseFloat(getVal('pricePerKg')) || 0;
        const cost = parseFloat(getVal('costPerBox')) || 0;

        const totalRev = boxes * kgBox * price;
        const totalCost = boxes * cost;
        const net = totalRev - totalCost;
        const perBox = boxes > 0 ? net / boxes : 0;

        setText('netProfit', net.toLocaleString());
        setText('profitPerBox', perBox.toLocaleString());
    });

    // 設定清空按鈕
    bindClick('btnClearLocalStorage', () => {
        if(confirm('確定要清空所有紀錄嗎？這無法復原！')) {
            localStorage.clear();
            alert('已清空，網頁將重新整理。');
            location.reload();
        }
    });
}

// 輔助函數
function bindClick(id, func) {
    const btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', func);
}
function getDate(id) {
    const val = document.getElementById(id).value;
    return val ? new Date(val) : null;
}
function getVal(id) { return document.getElementById(id).value; }
function setText(id, text) { 
    const el = document.getElementById(id);
    if(el) el.innerText = text;
}
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

// ==========================================
// 4. 蜂王顏色渲染
// ==========================================
function renderQueenColors() {
    const colors = [
        {c:'#2196f3', n:'藍', y:'0, 5'}, // Blue
        {c:'#ffffff', n:'白', y:'1, 6'}, // White
        {c:'#ffeb3b', n:'黃', y:'2, 7'}, // Yellow
        {c:'#f44336', n:'紅', y:'3, 8'}, // Red
        {c:'#4caf50', n:'綠', y:'4, 9'}  // Green
    ];
    
    const currentYear = new Date().getFullYear();
    const yearDigit = currentYear % 10; // 5

    // 設定頁面的列表
    const container = document.getElementById('settings-queen-color');
    if(container) {
        let html = '';
        colors.forEach(c => {
            const isCurrent = (yearDigit % 5 === colors.indexOf(c)); 
            // 簡易判斷: 0,5是藍(idx0), 1,6是白(idx1)...
            const style = isCurrent ? 'border:3px solid #000; transform:scale(1.1);' : 'border:1px solid #ddd;';
            html += `<div style="background:${c.c}; width:60px; height:60px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:8px; ${style} color:#333; font-weight:bold; font-size:0.8em; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <span>${c.n}</span><span style="font-size:0.7em">${c.y}</span>
            </div>`;
        });
        container.innerHTML = html;
    }

    // 首頁的單一顯示
    const homeContainer = document.getElementById('home-queen-color');
    if(homeContainer) {
        // 0->Blue(0), 1->White(1)... 5->Blue(0)
        const idx = yearDigit < 5 ? yearDigit : yearDigit - 5;
        const c = colors[idx];
        homeContainer.innerHTML = `<div style="background:${c.c}; width:50px; height:50px; border-radius:50%; border:3px solid #333; margin:0 auto; display:flex; align-items:center; justify-content:center; font-weight:bold;">${c.n}</div>`;
    }
}

// ==========================================
// 5. 資料自動儲存 (Auto-Save)
// ==========================================
function setupAutoSave() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // 讀取
        if(input.id) {
            const val = localStorage.getItem('bee_' + input.id);
            if(val) {
                if(input.type === 'checkbox') input.checked = (val === 'true');
                else input.value = val;
            }
        }
        // 儲存
        input.addEventListener('change', function() {
            if(this.id) {
                const v = (this.type === 'checkbox') ? this.checked : this.value;
                localStorage.setItem('bee_' + this.id, v);
            }
        });
    });
}

// 複製文字功能
function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    if(!el) return;
    el.select();
    el.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(el.value).then(() => {
        alert('✅ 已複製到剪貼簿');
    }).catch(err => {
        console.error('複製失敗', err);
    });
}

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

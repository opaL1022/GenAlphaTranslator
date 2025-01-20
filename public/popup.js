/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/

const circleToggle = document.getElementById('circleToggle');
const circleSwitch = document.getElementById('circleSwitch');
const changeTitle = document.getElementById('title');
chrome.storage.sync.get("checkboxState", (data) => {
    if (data.checkboxState !== undefined) {
        circleToggle.checked = data.checkboxState;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (circleToggle.checked) {
                circleSwitch.style.backgroundColor = '#4CAF50';
                console.log('Switch is ON');
                changeTitle.style.color = '#4CAF50';
                chrome.tabs.sendMessage(activeTab.id, { action: "enable" });
            }
            else {
                circleSwitch.style.backgroundColor = '#ccc';
                console.log('Switch is OFF');
                changeTitle.style.color = '#ccc';
                chrome.tabs.sendMessage(activeTab.id, { action: "disable" });
            }
        });
    }
});
if (!circleToggle || !circleSwitch || !changeTitle) {
    throw new Error('Elements not found');
}
circleToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ checkboxState: circleToggle.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (circleToggle.checked) {
            circleSwitch.style.backgroundColor = '#4CAF50';
            changeTitle.style.color = '#4CAF50';
            chrome.tabs.sendMessage(activeTab.id, { action: "enable" });
        }
        else {
            circleSwitch.style.backgroundColor = '#ccc';
            changeTitle.style.color = '#ccc';
            chrome.tabs.sendMessage(activeTab.id, { action: "disable" });
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    // 獲取滑桿和顯示數值的 DOM 元素
    const slider = document.getElementById("slider");
    const sliderValue = document.getElementById("sliderValue");
    const textContainer = document.getElementById("text-container");
    const originalText = "skibidi density";
    if (!slider || !sliderValue) {
        console.error("Slider or sliderValue element not found");
        return;
    }
    function renderText(colorIndex) {
        const textLength = originalText.length;
        let html = "";
        // 遍歷文本，根據 slider 值設置字的顏色
        for (let i = 0; i < textLength; i++) {
            if (i < colorIndex) {
                html += `<span style="color: #4CAF50;">${originalText[i]}</span>`;
            }
            else {
                html += originalText[i];
            }
        }
        // 更新文本容器
        textContainer.innerHTML = html;
    }
    // 初始化滑桿數值，從 chrome.storage 獲取已保存的值
    chrome.storage.sync.get("sliderValue", (data) => {
        const storedValue = data.sliderValue !== undefined ? data.sliderValue : "0"; // 默認值為 50
        slider.value = storedValue;
        sliderValue.textContent = storedValue;
    });
    // 添加滑桿變化事件監聽
    slider.addEventListener("input", () => {
        const currentValue = slider.value;
        const textSliderValue = parseInt(currentValue, 10);
        const textLength = originalText.length;
        const curColorIndex = Math.round((textSliderValue / 100) * textLength);
        chrome.storage.sync.set({ colorIndex: curColorIndex }, () => {
        });
        // 更新顯示數值
        sliderValue.textContent = currentValue;
        // 將滑桿值保存到 chrome.storage
        chrome.storage.sync.set({ sliderValue: currentValue }, () => {
        });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab?.id !== undefined) {
                chrome.tabs.sendMessage(activeTab.id, { sliderValue: currentValue }, (response) => {
                });
            }
        });
        renderText(curColorIndex);
    });
    chrome.storage.sync.get("colorIndex", (data) => {
        const colorIndex = data.colorIndex !== undefined ? data.colorIndex : 0;
        renderText(colorIndex);
    });
});

/******/ })()
;
//# sourceMappingURL=popup.js.map
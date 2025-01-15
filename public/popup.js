/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/

const circleToggle = document.getElementById('circleToggle');
const circleSwitch = document.getElementById('circleSwitch');
if (!circleToggle || !circleSwitch) {
    throw new Error('Elements not found');
}
circleToggle.addEventListener('change', () => {
    if (circleToggle.checked) {
        circleSwitch.style.backgroundColor = '#4CAF50'; // ON 状态背景色
        console.log('Switch is ON');
    }
    else {
        circleSwitch.style.backgroundColor = '#ccc'; // OFF 状态背景色
        console.log('Switch is OFF');
    }
});

/******/ })()
;
//# sourceMappingURL=popup.js.map
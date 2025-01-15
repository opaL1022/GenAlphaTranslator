(()=>{"use strict";const e=document.getElementById("circleToggle"),c=document.getElementById("circleSwitch");if(!e||!c)throw new Error("Elements not found");e.addEventListener("change",(()=>{e.checked?(c.style.backgroundColor="#4CAF50",console.log("Switch is ON")):(c.style.backgroundColor="#ccc",console.log("Switch is OFF"))}))})();

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/

const circleToggle = document.getElementById('circleToggle');
const circleSwitch = document.getElementById('circleSwitch');
const changeTitle = document.getElementById('title');
if (!circleToggle || !circleSwitch || !changeTitle) {
    throw new Error('Elements not found');
}
circleToggle.addEventListener('change', () => {
    if (circleToggle.checked) {
        circleSwitch.style.backgroundColor = '#4CAF50'; // ON 状态背景色
        console.log('Switch is ON');
        changeTitle.style.color = '#4CAF50';
    }
    else {
        circleSwitch.style.backgroundColor = '#ccc'; // OFF 状态背景色
        console.log('Switch is OFF');
        changeTitle.style.color = '#ccc';
    }
});

/******/ })()
;
//# sourceMappingURL=popup.js.map

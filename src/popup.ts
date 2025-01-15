const circleToggle = document.getElementById('circleToggle') as HTMLInputElement;
const circleSwitch = document.getElementById('circleSwitch') as HTMLDivElement;
const changeTitle = document.getElementById('title') as HTMLDivElement;
if (!circleToggle || !circleSwitch ||!changeTitle) {
    throw new Error('Elements not found');
}

circleToggle.addEventListener('change', () => {
    if (circleToggle.checked) {
        circleSwitch.style.backgroundColor = '#4CAF50'; // ON 状态背景色
        console.log('Switch is ON');
        changeTitle.style.color = '#4CAF50'
    } else {
        circleSwitch.style.backgroundColor = '#ccc'; // OFF 状态背景色
        console.log('Switch is OFF');
        changeTitle.style.color = '#ccc'
    }
});

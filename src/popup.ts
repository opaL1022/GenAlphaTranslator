const circleToggle = document.getElementById('circleToggle') as HTMLInputElement;
const circleSwitch = document.getElementById('circleSwitch') as HTMLDivElement;
const changeTitle = document.getElementById('title') as HTMLDivElement;

chrome.storage.sync.get("checkboxState", (data) => {
    if (data.checkboxState !== undefined) {
        circleToggle.checked = data.checkboxState;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (circleToggle.checked) {
                circleSwitch.style.backgroundColor = '#4CAF50';
                console.log('Switch is ON');
                changeTitle.style.color = '#4CAF50'
                chrome.tabs.sendMessage(activeTab.id as number, { action: "enable"});
            } else {
                circleSwitch.style.backgroundColor = '#ccc';
                console.log('Switch is OFF');
                changeTitle.style.color = '#ccc'
                chrome.tabs.sendMessage(activeTab.id as number, { action: "disable"});
            }
        });    
    }
});


if (!circleToggle || !circleSwitch ||!changeTitle) {
    throw new Error('Elements not found');
}

circleToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ checkboxState: circleToggle.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (circleToggle.checked) {
            circleSwitch.style.backgroundColor = '#4CAF50';
            console.log('Switch is ON');
            changeTitle.style.color = '#4CAF50'
            chrome.tabs.sendMessage(activeTab.id as number, { action: "enable"});
        } else {
            circleSwitch.style.backgroundColor = '#ccc';
            console.log('Switch is OFF');
            changeTitle.style.color = '#ccc'
            chrome.tabs.sendMessage(activeTab.id as number, { action: "disable"});
        }
    });    
});

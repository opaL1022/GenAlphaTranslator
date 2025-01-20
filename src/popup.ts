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
            changeTitle.style.color = '#4CAF50'
            chrome.tabs.sendMessage(activeTab.id as number, { action: "enable"});
        } else {
            circleSwitch.style.backgroundColor = '#ccc';
            changeTitle.style.color = '#ccc'
            chrome.tabs.sendMessage(activeTab.id as number, { action: "disable"});
        }
    });    
});

document.addEventListener("DOMContentLoaded", () => {
    // 獲取滑桿和顯示數值的 DOM 元素
    const slider = document.getElementById("slider") as HTMLInputElement;
    const sliderValue = document.getElementById("sliderValue") as HTMLSpanElement;
  
    if (!slider || !sliderValue) {
      console.error("Slider or sliderValue element not found");
      return;
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
    });
  });
  
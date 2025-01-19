console.log('Content script loaded!');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enable") {
        enableFeature();
    } else if (message.action === "disable") {
        disableFeature();
    }
});

function enableFeature(): void {
    console.log("功能已啟用");
    // 啟用功能的邏輯
    // 將文本內容改為大寫
    const convertTextToUppercase = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // 確保文本內容存在，並檢查是否已修改過
            const parent = node.parentElement;
            if (parent && !parent.dataset.modified) {
                node.nodeValue = node.nodeValue?.toUpperCase() || '';
                parent.dataset.modified = 'true'; // 添加標記，避免重複處理
            }
        }
    };
    
    // 遍歷 DOM 並應用替換
    const traverseAndModify = (root: Node) => {
        const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
            const parent = node.parentNode as HTMLElement;
            if (parent && ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT; // 跳過不處理
            }
            return NodeFilter.FILTER_ACCEPT;
            },
        }
        );
        let node: Node | null;
        while ((node = walker.nextNode())) {
        convertTextToUppercase(node);
        }
    };
    
    // 執行靜態文本修改
    traverseAndModify(document.body);
    
    // 監聽 DOM 的動態變化，處理新增節點和被覆蓋的文本
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
        // 處理新增節點
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
            traverseAndModify(node);
            }
        });
        // 處理已存在節點的變化
        if (mutation.type === 'characterData') {
            convertTextToUppercase(mutation.target);
        }
        });
    });
    observer.observe(document.body, {
        childList: true, // 監聽子節點的新增或刪除
        subtree: true, // 監聽整個子樹
        characterData: true, // 監聽文本內容的變化
    });
    
    console.log('Text content successfully converted to uppercase and monitored!');
  
}

function disableFeature(): void {
    console.log("功能已禁用");
    // 禁用功能的邏輯
    window.location.reload();
}





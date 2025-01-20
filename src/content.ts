const dict = require('../public/dictionary.json');

if(!dict){
    console.log("dictionary.json is empty");
}
console.log(dict);
console.log('Content script loaded!');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enable") {
        enableFeature();
    } else if (message.action === "disable") {
        disableFeature();
    }
});

function enableFeature(): void {//啟用插件
    console.log("功能已啟用");
    const convertTextToUppercase = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent && !parent.dataset.modified) {
                let context = [];
                if(node.nodeValue){
                    let texts = node.nodeValue.split(/(\s+|[.,!?;(){}[\]"':])/).filter(Boolean);
                    for(let i = 0; i < texts.length; i++){
                        let word = texts[i].toLowerCase();
                        if(word in dict){
                            let cap = /^[A-Z]$/.test(texts[i].charAt(0));
                            let text = dict[word][0];
                            context.push(cap ? text.charAt(0).toUpperCase() + text.slice(1) : text);
                        }else{
                            context.push(texts[i]);
                        }
                    }
                }
                node.nodeValue = context.join('');
                parent.dataset.modified = 'true';
            }
        }
    };
    
    const traverseAndModify = (root: Node) => {// 遍歷 DOM 並應用替換
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
    
    
    traverseAndModify(document.body);// 執行靜態文本修改
    
    const observer = new MutationObserver((mutations) => {// 監聽 DOM 的動態變化，處理新增節點和被覆蓋的文本
        mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
            traverseAndModify(node);
            }
        });
        if (mutation.type === 'characterData') {
            convertTextToUppercase(mutation.target);
        }
        });
    });
    observer.observe(document.body, {
        childList: true, 
        subtree: true, 
        characterData: true,
    });
    
    console.log('Text content successfully converted to uppercase and monitored!');
  
}

function disableFeature(): void {// 禁用插件
    console.log("功能已禁用");
    window.location.reload();
}

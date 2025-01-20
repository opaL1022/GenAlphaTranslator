const dict = require('../public/dictionary.json');

if(!dict){
    console.log("dictionary.json is empty");
}
console.log(dict);
console.log('Content script loaded!');

let density = 0;

function ensureDomReady(callback: () => void): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        callback();
    } else {
        // 如果 DOM 尚未準備好，等到 loaded 時再執行 callback
        window.addEventListener('DOMContentLoaded', callback, { once: true });
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "enable") {
        ensureDomReady(enableFeature);
        sendResponse({ status: "success" });
    } else if (message.action === "disable") {
        disableFeature();
        sendResponse({ status: "success" });
    }else if (message.sliderValue !== undefined) {
        console.log("Received slider value:", message.sliderValue);
        density = message.sliderValue;
        window.location.reload();
  
        ensureDomReady(enableFeature);
     
        sendResponse({ status: "success" }); // 回應消息
        return true;
    }

});



function enableFeature(): void {//啟用插件
    console.log("功能已啟用");
    const convertText = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent && !parent.dataset.modified) {
                let context = [];
                if(node.nodeValue){
                    let texts = node.nodeValue.split(/(\s+|[.,!?;(){}[\]"':])/).filter(Boolean);
                    for(let i = 0; i < texts.length; i++){
                        let word = texts[i].toLowerCase();
                        let cap = /^[A-Z]$/.test(texts[i].charAt(0));
                        if(word in dict){
                            let text = dict[word][0];
                            context.push(cap ? text.charAt(0).toUpperCase() + text.slice(1) : text);
                        }else{
                            const randomNum = Math.floor(Math.random() * 100);
                            if(randomNum<density)
                            {
                                const dictRand : string[] = Object.values(dict);
                                const dictLen = dictRand.length;
                                const dictRandNum = Math.floor(Math.random() * dictLen);
                                let text = dictRand[dictRandNum][0];//TODO 記得改
                                context.push(cap ? text.charAt(0).toUpperCase() + text.slice(1) : text);
                            }
                            else
                            {
                                context.push(texts[i]);
                            }
                        }
                    }
                }
                node.nodeValue = context.join('');
                parent.dataset.modified = 'true';
            }
        }
    };

    // function clearModifiedTags(): void {
    //     const modifiedNodes = document.querySelectorAll('[data-modified="true"]');
    //     modifiedNodes.forEach((node) => {
    //       node.removeAttribute('data-modified'); // 移除標記
    //       if (node.nodeType === Node.TEXT_NODE) {
    //         const parent = node.parentElement;
    //         if (parent) {
    //           parent.normalize(); // 將文本節點合併
    //         }
    //       }
    //     });
    //     console.log("All modified tags have been cleared.");
    //   }
    
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
        convertText(node);
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
            convertText(mutation.target);
        }
        });
    });
    observer.observe(document.body, {
        childList: true, 
        subtree: true, 
        characterData: true,
    });
    
  
}

function disableFeature(): void {// 禁用插件
    console.log("功能已禁用");
    window.location.reload();
}

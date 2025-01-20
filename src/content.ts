interface Dictionary{
    [key: string]: string[];
}
const dict: Dictionary = require('../public/dictionary.json');
const dictArray = Object.values(dict).flat();
const regex = /(\s+|[.,!?;(){}[\]"':])/;
const textContainer = document.getElementById("text-container") as HTMLElement;
let originalTextMap: Map<Node, string> = new Map();

if(!dict){
    console.log("dictionary.json is empty");
}
console.log(dict);
console.log('Content script loaded!');


function ensureDomReady(callback: () => void): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        callback();
    } else {
        // 如果 DOM 尚未準備好，等到 loaded 時再執行 callback
        window.addEventListener('DOMContentLoaded', callback, { once: true });
    }
}

let density = 0;
let curState = false;
let debounceTimer : NodeJS.Timeout | null = null;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "enable") {
        ensureDomReady(enableFeature);
        curState = true;
        sendResponse({ status: "success" });
    } else if (message.action === "disable") {
        disableFeature();
        curState = false;
        sendResponse({ status: "success" });
    }else if (message.sliderValue !== undefined&&curState) {
        console.log("Received slider value:", message.sliderValue);
        density = message.sliderValue;
        
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            restoreOriginalText();

            setTimeout(() => {
                clearModifiedTags();
            }, 0);

            setTimeout(() => {
                ensureDomReady(enableFeature);
            }, 0);
        }, 300); // 延遲 300 毫秒發送訊息，根據需求調整時間

        
        
        sendResponse({ status: "success" }); // 回應消息
        return true;
    }
    else {
        sendResponse({ status: "failed" });
    }
});



function enableFeature(): void {
    console.log("功能已啟用");

    const convertText = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;

            // 如果該節點未被修改過，則儲存原始文本並進行修改
            if (parent && !parent.hasAttribute('data-modified')) {
                let context = [];

                // 儲存原始文本
                if (node.nodeValue !== null && !originalTextMap.has(node)) {
                    originalTextMap.set(node, node.nodeValue); // 保存原始文本
                    console.log('Original text saved:', node.nodeValue);
                }
                if (node.nodeValue) {
                    let texts = node.nodeValue.split(regex).filter(Boolean);
                    for (let i = 0; i < texts.length; i++) {
                        let word = texts[i].toLowerCase();
                        let cap = /^[A-Z]$/.test(texts[i].charAt(0));
                        if(regex.test(texts[i].charAt(0))){
                            context.push(texts[i]);
                        }else if (word in dict) {
                            let textLen = dict[word].length;
                            let textIndex = Math.floor(Math.random() * textLen);
                            let text = dict[word][textIndex]; // 隨機替換文本
                            context.push(cap ? text.charAt(0).toUpperCase() + text.slice(1) : text);
                        }else{
                            const randomNum = Math.floor(Math.random() * 100);
                            if (randomNum < density) {
                                const dictLen = dictArray.length;
                                const dictRandNum = Math.floor(Math.random() * dictLen);
                                let text = dictArray[dictRandNum]; // 隨機替換文本
                                context.push(cap ? text.charAt(0).toUpperCase() + text.slice(1) : text);
                            } else {
                                context.push(texts[i]);
                            }
                        }
                    }
                }

                // 修改文本並標註已修改
                node.nodeValue = context.join('');
                parent.setAttribute('data-modified', 'true');
                console.log('Text modified:', node.nodeValue);
            }
        }
    };

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
            convertText(node);
        }
    };

    traverseAndModify(document.body); // 遍歷並修改頁面文本
    
    // 設置監聽，處理新增節點和修改的文本
    const observer = new MutationObserver((mutations) => {
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
    //window.location.reload();
    restoreOriginalText();
    setTimeout(() => {
        clearModifiedTags();
    }, 0);
}

function restoreOriginalText(): void {
    // 恢復所有已修改節點的原始文本
    originalTextMap.forEach((originalText, node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = originalText; // 恢復原始文本
            originalTextMap.delete(node);   // 刪除已恢復的文本映射
        }
    });
    console.log("所有文本已恢复原状");
}

function clearModifiedTags(): void {
    // 獲取所有已標記為修改過的元素
    const modifiedNodes = document.querySelectorAll('[data-modified="true"]');
    modifiedNodes.forEach((node) => {
        // 只有在元素節點的情況下才移除標籤
        if (node.nodeType === Node.ELEMENT_NODE) {
            const parent = node as HTMLElement;
            parent.removeAttribute('data-modified');  // 清除標籤
        }
    });
    console.log("所有已修改的标记已清除");
}




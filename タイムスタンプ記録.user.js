// ==UserScript==
// @name         タイムスタンプ記録
// @namespace    https://www.youtube.com/
// @version      9.5
// @description  タイムスタンプを記録
// @match        *://www.youtube.com/watch?v*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let timestamps = [];
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    let container, btn, lockButton, hideButton;
    let isLocked = false;
    let isAscending = false;
    let isHidden = localStorage.getItem('timestampHiddenState') === 'true';


    function loadTimestamps() {

        let storedTimestamps = localStorage.getItem('timestamps');
        if (storedTimestamps) {
            timestamps = JSON.parse(storedTimestamps);
        }
    }

   function loadSettings() {
    let storedTimestamps = localStorage.getItem('timestamps');
    if (storedTimestamps) timestamps = JSON.parse(storedTimestamps);
    // 不再處理隱藏狀態，因為已經在變數初始化時讀取
}
    function saveTimestamps() {
        localStorage.setItem('timestamps', JSON.stringify(timestamps));
    }

    function recordTimestamp() {
        let video = document.querySelector('video');
        if (video) {
            let currentTime = video.currentTime;
            let hours = Math.floor(currentTime / 3600);
            let minutes = Math.floor((currentTime % 3600) / 60);
            let seconds = Math.floor(currentTime % 60);
            let formattedTimestamp = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} [${(timestamps.length + 1).toString().padStart(2, '0')}]`;
            timestamps.unshift(formattedTimestamp);
            saveTimestamps();
            updateTimestampList();
        } else {
            showErrorMessage("動画が見つかりませんでした。ページをリフレッシュして再試行してください！");
        }
    }
function updateTimestampList() {
    let list = document.getElementById("timestamp-list");
    if (list) {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        if (isAscending) {
            timestamps.sort();
        } else {
            timestamps.sort().reverse();
        }

timestamps.forEach((t, index) => {
    let listItem = document.createElement("li");
    listItem.style.display = "flex";
    listItem.style.alignItems = "center";
    listItem.style.marginBottom = "4px";
    listItem.style.padding = "2px";
    listItem.style.width = "100%";
    listItem.style.overflow = "visible";
    listItem.style.flexWrap = "nowrap";
    listItem.style.whiteSpace = "nowrap";
    listItem.style.textOverflow = "ellipsis";

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.classList.add("delete-btn");
    deleteButton.style.fontSize = "14px";
    deleteButton.style.padding = "10px 20px";
    deleteButton.style.marginRight = "6px";
    deleteButton.style.background = "#FF6B6B";
    deleteButton.style.color = "black";
    deleteButton.style.border = "1px solid #D63A3A";
    deleteButton.style.fontWeight = "bold";
    deleteButton.style.transition = "background-color 0.3s, transform 0.2s";


    deleteButton.onmouseover = function() {
        deleteButton.style.background = "#FF4C4C";
    };

    deleteButton.onmouseleave = function() {
        deleteButton.style.background = "#FF6B6B";
    };


    deleteButton.onmousedown = function() {
        deleteButton.style.background = "#D63A3A";
        deleteButton.style.transform = "scale(0.95)";
    };

    deleteButton.onmouseup = function() {
        deleteButton.style.background = "#FF4C4C";
        deleteButton.style.transform = "scale(1)";
    };

    deleteButton.onclick = function() {
        deleteTimestamp(index);
    };


    let editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.classList.add("edit-btn");
    editButton.style.fontSize = "14px";
    editButton.style.padding = "10px 20px";
    editButton.style.marginRight = "6px";
    editButton.style.background = "#FFDD57";
    editButton.style.color = "black";
    editButton.style.border = "1px solid #F39C12";
    editButton.style.fontWeight = "bold";
    editButton.style.transition = "background-color 0.3s, transform 0.2s";


    editButton.onmouseover = function() {
        editButton.style.background = "#FFCF57";
    };

    editButton.onmouseleave = function() {
        editButton.style.background = "#FFDD57";
    };


    editButton.onmousedown = function() {
        editButton.style.background = "#F39C12";
        editButton.style.transform = "scale(0.95)";
    };

    editButton.onmouseup = function() {
        editButton.style.background = "#FFCF57";
        editButton.style.transform = "scale(1)";
    };

    editButton.onclick = function() {
        editTimestamp(index);
    };
    // 時間戳按鈕
    let displayText = `${t}`;
    let copyButton = document.createElement("button");
    copyButton.textContent = displayText;
    copyButton.classList.add("copy-btn");
    copyButton.style.fontSize = "16px";
    copyButton.style.padding = "10px 2px";
    copyButton.style.marginRight = "20px";
    copyButton.style.background = "#A3C9D9";
    copyButton.style.color = "black";
    copyButton.style.fontWeight = "bold";
    copyButton.style.border = "1px solid #9BBED4";
    copyButton.style.whiteSpace = "nowrap";
    copyButton.style.writingMode = "horizontal-tb";

    copyButton.style.width = "250px";
    copyButton.style.overflowX = "auto";
    copyButton.style.textOverflow = "clip";
    copyButton.style.whiteSpace = "nowrap";


    copyButton.style.display = "inline-flex";
    copyButton.style.justifyContent = "flex-start";
    copyButton.style.alignItems = "center";

    copyButton.style.overflow = "hidden";
    copyButton.style.overflowX = "auto";

    copyButton.onmouseover = function() {
        copyButton.style.background = "#88B8D9";
    };

    copyButton.onmouseleave = function() {
        copyButton.style.background = "#A3C9D9";
    };

    copyButton.onmousedown = function() {
        copyButton.style.background = "#7AA8C9";
    };

    copyButton.onmouseup = function() {
        copyButton.style.background = "#88B8D9";
    };

    copyButton.onclick = function() {
        copyToClipboard(displayText);
    };


    let container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.flexWrap = "nowrap";
    container.style.width = "100%";
    container.style.minWidth = "400px";
    container.style.padding = "0";


    container.appendChild(deleteButton);
    container.appendChild(editButton);
    container.appendChild(copyButton);


    listItem.appendChild(container);
    list.appendChild(listItem);


    let updateWidth = () => {
        let width = container.scrollWidth;
        container.style.width = `${width + 20}px`;
    };

    setTimeout(updateWidth, 100);
});
    }
}
function editTimestamp(index) {
    if (document.getElementById("edit-container")) return;


    let currentTimestamp = timestamps[index];
    let editContainer = document.createElement("div");
    editContainer.id = "edit-container";
    editContainer.style.position = "fixed";
    editContainer.style.top = "50%";
    editContainer.style.left = "50%";
    editContainer.style.transform = "translate(-50%, -50%)";
    editContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    editContainer.style.color = "white";
    editContainer.style.padding = "20px";
    editContainer.style.borderRadius = "8px";
    editContainer.style.zIndex = "9999";
    editContainer.style.display = "flex";
    editContainer.style.flexDirection = "column";
    editContainer.style.alignItems = "center";
    editContainer.style.cursor = "move";
    editContainer.style.width = "400px";  // 增加寬度
    editContainer.style.height = "auto";  // 改為自動高度
    editContainer.style.userSelect = "none";

    let inputField = document.createElement("textarea");
    inputField.value = currentTimestamp;
    inputField.style.fontSize = "18px";
    inputField.style.padding = "10px";
    inputField.style.width = "350px";  // 增加寬度
    inputField.style.height = "60px";  // 減少高度
    inputField.style.marginBottom = "10px";
    inputField.style.lineHeight = "1.5";
    inputField.style.border = "1px solid #ccc";
    inputField.style.borderRadius = "5px";
    inputField.style.overflow = "auto";
    inputField.style.resize = "none";
    inputField.style.whiteSpace = "pre-wrap";
    inputField.style.textAlign = "left";

    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";

    let saveButton = document.createElement("button");
    saveButton.textContent = "保存";
    saveButton.style.padding = "8px 50px";
    saveButton.style.backgroundColor = "#28a745";
    saveButton.style.color = "white";
    saveButton.style.border = "none";
    saveButton.style.cursor = "pointer";
    saveButton.style.fontWeight = "bold";

    let cancelButton = document.createElement("button");
    cancelButton.textContent = "キャンセル";
    cancelButton.style.padding = "8px 16px";
    cancelButton.style.backgroundColor = "#dc3545";
    cancelButton.style.color = "white";
    cancelButton.style.border = "none";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontWeight = "bold";

    saveButton.onclick = function() {
        let newTimestamp = inputField.value;
        if (newTimestamp && newTimestamp !== currentTimestamp) {
            timestamps[index] = newTimestamp;
            saveTimestamps();
            updateTimestampList();
        }
        document.body.removeChild(editContainer);
    };

    cancelButton.onclick = function() {
        document.body.removeChild(editContainer);
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    editContainer.appendChild(inputField);
    editContainer.appendChild(buttonContainer);
    document.body.appendChild(editContainer);

    let isDragging = false;
    let offsetX, offsetY;

    // 阻止按钮被拖动
    editContainer.onmousedown = function(e) {
        if (e.target === buttonContainer || e.target === cancelButton || e.target === saveButton || e.target === inputField) {
            return;  // Do not allow drag if clicked on buttons or input
        }

        isDragging = true;
        offsetX = e.clientX - editContainer.getBoundingClientRect().left;
        offsetY = e.clientY - editContainer.getBoundingClientRect().top;

        // Prevent interaction with other elements while dragging
        document.body.style.pointerEvents = "none";  // Disable pointer events for the body

        editContainer.style.cursor = "grabbing";
    };

    document.onmousemove = function(e) {
        if (isDragging) {
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            editContainer.style.left = x + "px";
            editContainer.style.top = y + "px";
        }
    };

    document.onmouseup = function() {
        isDragging = false;
        editContainer.style.cursor = "move";

        // Restore pointer events after dragging
        document.body.style.pointerEvents = "auto";  // Re-enable pointer events for the body
    };

    inputField.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            saveButton.click();
        }
    });

    let dragIsActive = false;
    let dragOffsetX, dragOffsetY;

    editContainer.addEventListener("mousedown", function(e) {
        if (e.target === inputField || e.target === buttonContainer || e.target === saveButton || e.target === cancelButton) return;  // Don't allow drag if clicked on input or buttons
        dragIsActive = true;
        dragOffsetX = e.clientX - editContainer.getBoundingClientRect().left;
        dragOffsetY = e.clientY - editContainer.getBoundingClientRect().top;
        editContainer.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function(e) {
        if (dragIsActive) {
            let left = e.clientX - dragOffsetX;
            let top = e.clientY - dragOffsetY;
            editContainer.style.left = left + "px";
            editContainer.style.top = top + "px";
        }
    });

    document.addEventListener("mouseup", function() {
        dragIsActive = false;
        editContainer.style.cursor = "move";
    });
}


    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showCustomCopySuccessMessage(text);
        }).catch(err => {
            console.error('コピー失敗', err);
        });
    }

    function showCustomCopySuccessMessage(text) {
        let messageBox = document.createElement("div");
        messageBox.textContent = `コピー成功: ${text}`;
        messageBox.style.position = "fixed";
        messageBox.style.top = "10px";
        messageBox.style.left = "50%";
        messageBox.style.transform = "translateX(-50%)";
        messageBox.style.padding = "10px 20px";
        messageBox.style.backgroundColor = "#28a745";
        messageBox.style.color = "white";
        messageBox.style.fontSize = "14px";
        messageBox.style.borderRadius = "5px";
        messageBox.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.2)";
        messageBox.style.zIndex = "9999";

        setTimeout(() => {
            messageBox.style.opacity = "0";
            setTimeout(() => {
                messageBox.remove();
            }, 500);
        }, 2000);

        document.body.appendChild(messageBox);
    }

    function deleteTimestamp(index) {
        timestamps.splice(index, 1);
        saveTimestamps();
        updateTimestampList();
    }
    function makeDraggable(element, allowDrag = true) {
        element.addEventListener('mousedown', function(e) {
            if (isLocked || !allowDrag) return;
            // 如果点击的是一个 button 且该按钮不是 hideButton，则不启动拖动
            if (e.target.closest("button") && e.target !== hideButton) return;
            e.preventDefault();
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            document.body.style.cursor = 'move';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            document.body.style.cursor = '';
        });
    }
    function toggleVisibility() {
        isHidden = !isHidden;
        applyHiddenState();
        localStorage.setItem('timestampHiddenState', isHidden); // 保存當前狀態
        hideButton.style.transform = "scale(0.95)";
        setTimeout(() => hideButton.style.transform = "scale(1)", 100);
    }

    function addUI() {
        if (isHidden) applyHiddenState();
        container = document.createElement("div");
        container.style.position = "absolute";
        container.style.top = "500px";
        container.style.left = "380px";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.background = "transparent";
        container.style.pointerEvents = "auto";


        btn = document.createElement("button");
        btn.textContent = "タイムスタンプ記録";
        btn.style.padding = "10px 50px";
        btn.style.background = "linear-gradient(to bottom, #FFFFFF, #E0F7FA)";
        btn.style.color = "black";
        btn.style.border = "2px solid #A0C4FF";
        btn.style.boxShadow = "2px 2px 6px rgba(0, 0, 0, 0.2)";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "18px";
        btn.style.fontWeight = "bold";
        btn.style.borderRadius = "6px";
        btn.style.pointerEvents = "auto";
        btn.style.zIndex = "101";
        btn.style.position = "relative";
        btn.style.top = "-1px";

        btn.onmouseover = function () {
            btn.style.background = "linear-gradient(to bottom, #E0F7FA, #B2EBF2)";
        };


        btn.onmouseout = function () {
            btn.style.background = "linear-gradient(to bottom, #FFFFFF, #E0F7FA)";
        };


        btn.onmousedown = function () {
            btn.style.background = "linear-gradient(to bottom, #B2EBF2, #80DEEA)";
        };

        btn.onmouseup = function () {
            btn.style.background = "linear-gradient(to bottom, #E0F7FA, #B2EBF2)";
        };

        btn.onclick = recordTimestamp;
        container.appendChild(btn);
        document.body.appendChild(container);

        let listContainer = document.createElement("div");
        //listContainer.style.position = "fixed";  // 改用 fixed 定位
        listContainer.style.background = "white";
        listContainer.style.padding = "4px";
        listContainer.style.border = "1px solid black";
        listContainer.style.overflowY = "auto";
        listContainer.style.zIndex = "9999";
        listContainer.style.pointerEvents = "auto";
        listContainer.style.width = "420px";
        listContainer.style.resize = isLocked ? "none" : "both"; // 根據鎖定狀態設置
        listContainer.style.height = "150px";
        listContainer.style.minWidth = "200px";
        listContainer.style.minHeight = "100px";
        listContainer.style.userSelect = "none";
        listContainer.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            makeDraggable(listContainer);

        });
        document.body.appendChild(listContainer);
        let heading = document.createElement("div");
        heading.style.display = "flex"; // 使用flex布局
        heading.style.alignItems = "center"; // 垂直居中
        heading.style.justifyContent = "flex-start"; // 将按钮靠左对齐，减少间距
        heading.style.padding = "5px 10px"; // 内边距
        heading.style.marginBottom = "10px"; // 标题与按钮之间的间距

        let headingTitle = document.createElement("h3");
        headingTitle.textContent = "長押しして移動";
        headingTitle.style.fontSize = "15px";
        headingTitle.style.fontWeight = "bold";
        headingTitle.style.margin = "0";

        // 将标题添加到heading
        heading.appendChild(headingTitle);

        // 创建按钮容器
        let buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex"; // 保证按钮容器是flex布局
        buttonContainer.style.marginLeft = "30px"; // 向右移动按钮的容器
        buttonContainer.style.gap = "5px"; // 设置按钮之间的间距

        let copyAllButton = document.createElement("button");
        copyAllButton.textContent = "全部コピー";
        copyAllButton.style.padding = "8px 8px";
        copyAllButton.style.fontSize = "14px";
        copyAllButton.classList.add("no-drag");
        copyAllButton.style.background = "linear-gradient(to bottom, #A8E6A0, #52C41A)";
        copyAllButton.style.color = "black";
        copyAllButton.style.border = "1px solid #3A8F12";
        copyAllButton.style.fontWeight = "bold";
        copyAllButton.style.transition = "background-color 0.3s, transform 0.2s";

        // 设置按钮的鼠标事件
        copyAllButton.onmouseover = function () {
            copyAllButton.style.background = "linear-gradient(to bottom, #9AE89F, #66B22C)";
        };
        copyAllButton.onmouseleave = function () {
            copyAllButton.style.background = "linear-gradient(to bottom, #A8E6A0, #52C41A)";
        };
        copyAllButton.onmousedown = function () {
            copyAllButton.style.background = "linear-gradient(to bottom, #74B94F, #4E9B16)";
            copyAllButton.style.transform = "scale(0.95)";
        };
        copyAllButton.onmouseup = function () {
            copyAllButton.style.background = "linear-gradient(to bottom, #9AE89F, #66B22C)";
            copyAllButton.style.transform = "scale(1)";
        };

        copyAllButton.onclick = function () {
            copyAllTimestamps();
        };

        let sortButton = document.createElement("button");
        sortButton.textContent = "並べ替え";
        sortButton.style.padding = "8px 20px";
        sortButton.style.fontSize = "14px";
        sortButton.classList.add("no-drag");
        sortButton.style.background = "linear-gradient(to bottom, #FFB6C1, #FF69B4)";
        sortButton.style.color = "black";
        sortButton.style.border = "1px solid #FF1493";
        sortButton.style.fontWeight = "bold";
        sortButton.style.transition = "background-color 0.3s, transform 0.2s";

        // 设置按钮的鼠标事件
        sortButton.onmouseover = function () {
            sortButton.style.background = "linear-gradient(to bottom, #FF9AAB, #FF4D92)";
        };
        sortButton.onmouseleave = function () {
            sortButton.style.background = "linear-gradient(to bottom, #FFB6C1, #FF69B4)";
        };
        sortButton.onmousedown = function () {
            sortButton.style.background = "linear-gradient(to bottom, #FF7C92, #FF3385)";
            sortButton.style.transform = "scale(0.95)";
        };
        sortButton.onmouseup = function () {
            sortButton.style.background = "linear-gradient(to bottom, #FF9AAB, #FF4D92)";
            sortButton.style.transform = "scale(1)";
        };

        function toggleSortOrder() {
            isAscending = !isAscending; // 切換排序方向
            updateTimestampList(); // 更新列表
            // 可選：添加一些視覺反饋
            sortButton.style.transform = "scale(0.95)";
            setTimeout(() => sortButton.style.transform = "scale(1)", 100);
        }

        sortButton.onclick = function () {
            toggleSortOrder();
        };

        let deleteAllButton = document.createElement("button");
        deleteAllButton.textContent = "×";
        deleteAllButton.style.padding = "5px 12px";
        deleteAllButton.style.fontSize = "16px";
        deleteAllButton.classList.add("no-drag");
        deleteAllButton.style.background = "linear-gradient(to bottom, #FF6F61, #FF3B30)";
        deleteAllButton.style.color = "white";
        deleteAllButton.style.border = "none";
        deleteAllButton.style.fontWeight = "bold";
        deleteAllButton.style.transition = "background-color 0.3s, transform 0.2s";
        deleteAllButton.style.borderRadius = "50%"; // 设置为圆形按钮

        // 设置按钮的鼠标事件
        deleteAllButton.onmouseover = function () {
            deleteAllButton.style.background = "linear-gradient(to bottom, #FF5A47, #FF3A32)";
        };
        deleteAllButton.onmouseleave = function () {
            deleteAllButton.style.background = "linear-gradient(to bottom, #FF6F61, #FF3B30)";
        };
        deleteAllButton.onmousedown = function () {
            deleteAllButton.style.background = "linear-gradient(to bottom, #FF4B3E, #FF1F18)";
            deleteAllButton.style.transform = "scale(0.95)";
        };
        deleteAllButton.onmouseup = function () {
            deleteAllButton.style.background = "linear-gradient(to bottom, #FF5A47, #FF3A32)";
            deleteAllButton.style.transform = "scale(1)";
        };

        // 点击删除按钮时显示确认窗口
        deleteAllButton.onclick = function () {
            showConfirmModal();
        };

// 自定义确认窗口
function showConfirmModal() {
    let modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "transparent";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "10000";

    let modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
     // 紅色粗邊框樣式
    modalContent.style.border = "4px solid #FF3B30"; // 加粗紅色邊框 (4px)
    modalContent.style.borderRadius = "12px"; // 圓角
    modalContent.style.boxShadow = "0 5px 25px rgba(255, 59, 48, 0.3)"; // 紅色陰影強化效果

    modalContent.style.borderRadius = "8px";
    modalContent.style.width = "300px";
    modalContent.style.textAlign = "center";
    modalContent.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    modalContent.style.cursor = "move"; // 關鍵：允許拖動
    modalContent.style.position = "absolute"; // 讓拖動時可改變位置

    let message = document.createElement("p");
    message.textContent = "すべての記録を削除しますか？";
    message.style.fontSize = "16px"; // 調整字體大小
    message.style.fontWeight = "bold"; // 設置為粗體
    message.style.color = "red"; // 讓文字變紅色，提高可視性
    document.body.appendChild(message);
   let isDragging = false;
    let offsetX, offsetY;

    modalContent.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return; // 避免按鈕觸發拖動
        isDragging = true;
        offsetX = e.clientX - modalContent.getBoundingClientRect().left;
        offsetY = e.clientY - modalContent.getBoundingClientRect().top;
    });
 // 禁用默認拖選行為
    modalContent.addEventListener('selectstart', function(e) {
        if (!isDragging) return true; // 允許文字選中
        e.preventDefault();
        return false;
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        modalContent.style.left = (e.clientX - offsetX) + 'px';
        modalContent.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });


    let buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "15px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center"; // 让按钮居中
    buttonContainer.style.gap = "10px"; // 设置按钮之间的间距（改小）

    let cancelButton = document.createElement("button");
    cancelButton.textContent = "いいえ";
    cancelButton.style.padding = "12px 30px";  // 加大按鈕尺寸
    cancelButton.style.fontSize = "16px";      // 放大字體
    cancelButton.style.width = "140px";       // 固定寬度
    cancelButton.style.backgroundColor = "#999";
    cancelButton.style.color = "#202124";
    cancelButton.style.fontWeight = "600";
    cancelButton.style.border = "none";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.borderRadius = "6px";   // 圓角也可以稍微加大

    let confirmButton = document.createElement("button");
    confirmButton.textContent = "削除";
    confirmButton.style.padding = "12px 30px"; // 加大按鈕尺寸
    confirmButton.style.fontSize = "16px";     // 放大字體
    confirmButton.style.width = "140px";      // 固定寬度
    confirmButton.style.backgroundColor = "#e74c3c";
    confirmButton.style.color = "white";
    confirmButton.style.textShadow = "0 1px 1px rgba(0, 0, 0, 0.3)";
    confirmButton.style.fontWeight = "600";
    confirmButton.style.border = "none";
    confirmButton.style.cursor = "pointer";
    confirmButton.style.borderRadius = "6px";  // 圓角也可以稍微加大

    // 关闭模态框
    cancelButton.onclick = function () {
        document.body.removeChild(modal);
    };

    // 确认删除
    confirmButton.onclick = function () {
        deleteAllTimestamps();
        document.body.removeChild(modal);
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);

    modalContent.appendChild(message);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

     document.onmousemove = function (e) {
        if (isDragging) {
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            modalContent.style.left = x + "px";
            modalContent.style.top = y + "px";
        }  };
    // 鼠标悬停和点击效果
    cancelButton.addEventListener("mouseover", function() {
        cancelButton.style.backgroundColor = "#666"; // 鼠标悬停时背景色变化
    });
    cancelButton.addEventListener("mouseout", function() {
        cancelButton.style.backgroundColor = "#999"; // 恢复原背景色
    });
    cancelButton.addEventListener("mousedown", function() {
        cancelButton.style.transform = "scale(0.95)"; // 按下时按钮缩小
    });
    cancelButton.addEventListener("mouseup", function() {
        cancelButton.style.transform = "scale(1)"; // 松开时恢复正常大小
    });

    confirmButton.addEventListener("mouseover", function() {
        confirmButton.style.backgroundColor = "#c0392b"; // 鼠标悬停时背景色变化
    });
    confirmButton.addEventListener("mouseout", function() {
        confirmButton.style.backgroundColor = "#e74c3c"; // 恢复原背景色
    });
    confirmButton.addEventListener("mousedown", function() {
        confirmButton.style.transform = "scale(0.95)"; // 按下时按钮缩小
    });
    confirmButton.addEventListener("mouseup", function() {
        confirmButton.style.transform = "scale(1)"; // 松开时恢复正常大小
    });
}


        // 删除所有时间戳
        function deleteAllTimestamps() {
            timestamps = []; // 清空时间戳数组
            saveTimestamps(); // 保存空数组
            updateTimestampList(); // 更新显示列表
        }

        // 将按钮添加到按钮容器
        buttonContainer.appendChild(copyAllButton);
        buttonContainer.appendChild(sortButton);
        buttonContainer.appendChild(deleteAllButton);

        // 将按钮容器添加到heading
        heading.appendChild(buttonContainer);

        // 将heading添加到listContainer
        listContainer.appendChild(heading);



        let ul = document.createElement("ul");
        ul.id = "timestamp-list";
        ul.style.listStyleType = "none";
        ul.style.padding = "0";
        ul.style.margin = "0";
        ul.style.textAlign = "center";
        listContainer.appendChild(ul);
        container.appendChild(listContainer);

        // 創建按鈕行容器
        let buttonRow = document.createElement("div");
        buttonRow.style.display = "flex";
        buttonRow.style.justifyContent = "space-between";
        buttonRow.style.width = "100%";
        buttonRow.style.marginTop = "5px";
        buttonRow.style.gap = "10px";

        // 鎖定按鈕 (左邊)
        lockButton = document.createElement("button");
        lockButton.textContent = "ロック"; // 初始狀態為"鎖定"
        lockButton.style.padding = "8px 16px";
        lockButton.style.width = "60px";
        lockButton.style.background = "linear-gradient(to bottom, #4CAF50, #388E3C)"; // 綠色表示未鎖定
        lockButton.style.color = "white";
        lockButton.style.border = "none";
        lockButton.style.cursor = "pointer";
        lockButton.style.fontSize = "14px";
        lockButton.style.fontWeight = "bold";
        lockButton.style.borderRadius = "6px";
        lockButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        lockButton.style.transition = "all 0.3s ease";
        lockButton.style.flex = "1";

        lockButton.onmouseover = function() {
            lockButton.style.background = isLocked
                ? "linear-gradient(to bottom, #D32F2F, #B71C1C)" // 鎖定狀態的深紅色
            : "linear-gradient(to bottom, #388E3C, #2E7D32)"; // 解鎖狀態的深綠色
            lockButton.style.boxShadow = "0 3px 8px rgba(0,0,0,0.3)";
        };
        lockButton.onmouseleave = function() {
            lockButton.style.background = isLocked
                ? "linear-gradient(to bottom, #FF5252, #D32F2F)" // 鎖定狀態的紅色
            : "linear-gradient(to bottom, #4CAF50, #388E3C)"; // 解鎖狀態的綠色
            lockButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        };
        lockButton.onmousedown = function() {
            lockButton.style.transform = "scale(0.98)";
        };
        lockButton.onmouseup = function() {
            lockButton.style.transform = "scale(1)";
        };

        lockButton.onclick = function() {
            toggleLock();
        };

        // 修改 toggleLock 函數
        function toggleLock() {
            isLocked = !isLocked;

            // 更新按鈕文字
            lockButton.textContent = isLocked ? "アンロック" : "ロック";

            // 更新按鈕顏色
            if (isLocked) {
                lockButton.style.background = "linear-gradient(to bottom, #FF5252, #D32F2F)"; // 紅色表示鎖定
            } else {
                lockButton.style.background = "linear-gradient(to bottom, #4CAF50, #388E3C)"; // 綠色表示未鎖定
            }

            // 保存鎖定狀態
            localStorage.setItem('timestampLockState', isLocked);

            // 添加點擊反饋
            lockButton.style.transform = "scale(0.95)";
            setTimeout(() => lockButton.style.transform = "scale(1)", 100);
        }

        // 在 loadSettings 函數中加載鎖定狀態
        function loadSettings() {
            let storedTimestamps = localStorage.getItem('timestamps');
            if (storedTimestamps) timestamps = JSON.parse(storedTimestamps);

            // 加載鎖定狀態
            let storedLockState = localStorage.getItem('timestampLockState');
            if (storedLockState !== null) {
                isLocked = storedLockState === 'true';
                lockButton.textContent = isLocked ? "アンロック" : "ロック";
                lockButton.style.background = isLocked
                    ? "linear-gradient(to bottom, #FF5252, #D32F2F)"
                : "linear-gradient(to bottom, #4CAF50, #388E3C)";
            }

            // 加載隱藏狀態
            let storedHiddenState = localStorage.getItem('timestampHiddenState');
            if (storedHiddenState !== null) {
                isHidden = storedHiddenState === 'true';
            }
        }

        // 確保在初始化時調用
        loadSettings();

        // 隱藏按鈕 (右邊)
        hideButton = document.createElement("button");
        hideButton.textContent = "隠す";
        hideButton.style.padding = "8px 16px"; // 恢復原始內邊距
        hideButton.style.width = "auto";
        hideButton.style.background = "linear-gradient(to bottom, #2196F3, #1976D2)";
        hideButton.style.color = "white";
        hideButton.style.border = "none";
        hideButton.style.cursor = "pointer";
        hideButton.style.fontSize = "14px";
        hideButton.style.fontWeight = "bold";
        hideButton.style.borderRadius = "6px";
        hideButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        hideButton.style.transition = "all 0.3s ease";
        hideButton.style.flex = "0 0 60px"; // flex-grow:0, flex-shrink:0, flex-basis:60px



        hideButton.onclick = function() {
            toggleVisibility();
        };

        // 正確添加按鈕到按鈕行
        buttonRow.appendChild(lockButton);
        buttonRow.appendChild(hideButton);

        // 將按鈕行添加到容器（只添加一次）
        container.appendChild(buttonRow);

        // 刪除這行重複的代碼
        // container.appendChild(hideButton); // <-- 這行要刪除

        document.body.appendChild(container);
        makeDraggable(container, true);

        loadTimestamps();
        updateTimestampList();
        applyHiddenState();

        function toggleVisibility() {
            isHidden = !isHidden;
            localStorage.setItem('timestampHiddenState', isHidden);
            applyHiddenState();

            // 添加點擊反饋
            hideButton.style.transform = "scale(0.95)";
            setTimeout(() => hideButton.style.transform = "scale(1)", 100);
        }

        function applyHiddenState() {
            if (!container) return;

            // 隱藏所有子元素（除了buttonRow）
            Array.from(container.children).forEach(child => {
                if (child !== buttonRow) {
                    child.style.opacity = isHidden ? "0" : "1";
                    child.style.pointerEvents = isHidden ? "none" : "auto";
                }
            });

            // 特別處理buttonRow中的按鈕
            if (buttonRow) {
                // 鎖定按鈕隨狀態隱藏/顯示
                lockButton.style.opacity = isHidden ? "0" : "1";
                lockButton.style.pointerEvents = isHidden ? "none" : "auto";

                // 永遠顯示隱藏按鈕
                hideButton.style.opacity = "1";
                hideButton.style.pointerEvents = "auto";
            }

            // 更新按鈕狀態
            hideButton.textContent = isHidden ? "表示" : "隠す";
            hideButton.style.background = isHidden ? "linear-gradient(to bottom, #FF5252, #D32F2F)"
            : "linear-gradient(to bottom, #2196F3, #1976D2)";

            // 容器交互性
            container.style.pointerEvents = isHidden ? "none" : "auto";
        }}

    function copyAllTimestamps() {
        let allTimestamps = timestamps.join('\n');
        navigator.clipboard.writeText(allTimestamps).then(() => {
            showCopySuccessMessage(allTimestamps);
        }).catch(err => {
            console.error('コピーに失敗しました', err);
        });
    }

    function showErrorMessage(message) {
        alert(message);
    }

    function showCopySuccessMessage(text) {
        let messageBox = document.createElement("div");
        messageBox.textContent = `コピーしました: ${text}`;
        messageBox.style.position = "fixed";
        messageBox.style.top = "10px";
        messageBox.style.left = "50%";
        messageBox.style.transform = "translateX(-50%)";
        messageBox.style.padding = "10px 20px";
        messageBox.style.backgroundColor = "#28a745";
        messageBox.style.color = "white";
        messageBox.style.fontSize = "14px";
        messageBox.style.borderRadius = "5px";
        messageBox.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.2)";
        messageBox.style.zIndex = "9999";

        setTimeout(() => {
            messageBox.style.opacity = "0";
            setTimeout(() => {
                messageBox.remove();
            }, 500);
        }, 2000);

        document.body.appendChild(messageBox);
    }
    loadSettings();
    addUI();
    updateTimestampList();
})();





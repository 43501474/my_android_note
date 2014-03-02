var html5rocks = {};
html5rocks.indexedDB = {};

html5rocks.indexedDB.db = null;

html5rocks.indexedDB.onerror = function(e) {
    console.log(e.value);
}

// 打开数据库
// onsuccess: 打开数据库成功时的回调函数
html5rocks.indexedDB.open = function(onsuccess) {
    var version = 1;
    var request = indexedDB.open("todos", version);

    // 打开对象库的时候，如果参数的版本号比对象库的版本号更大，要重新创建对象库
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // 版本变化事务自动启动
        e.target.transaction.onerror = html5rocks.indexedDB.onerror;

        // 如果存在旧的对象库，先删除
        if(db.objectStoreNames.contains("todo")) {
            db.deleteObjectStore("todo");
        }

        // 创建新的对象库，以timeStamp为主键
        var store = db.createObjectStore("todo",
                {keyPath: "timeStamp"});
    };

    // 打开对象库成功时的回调函数
    request.onsuccess = onsuccess;

    // 打开对象库失败时的回调函数
    request.onerror = html5rocks.indexedDB.onerror;
};


// 数据库打开成功后的回调函数，用来增加新记录
function do_add(e) {
    // 先保存打开的db引用
    html5rocks.indexedDB.db = e.target.result;

    var content = document.getElementById('content');
    addTodo(content.value, function() {
        location = 'index.html';
    });
}

function addNewRec() {
    html5rocks.indexedDB.open(do_add);
}

// 创建新记录
// todoText: 新记录的文本
// onsuccess: 创建记录成功后的回调函数
addTodo = function(todoText, onsuccess) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");
  var request = store.put({
    "text": todoText,
    "timeStamp" : new Date().getTime()
  });

  request.onsuccess = onsuccess;
  request.onerror = html5rocks.indexedDB.onerror;
};


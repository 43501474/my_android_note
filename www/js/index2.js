function addNewRec() {
    var content = document.getElementById('content');
    html5rocks.indexedDB.addTodo(content.value);

    location = '#index';
}

var html5rocks = {};
html5rocks.indexedDB = {};

html5rocks.indexedDB.db = null;

html5rocks.indexedDB.onerror = function(e) {
    console.log(e.value);
}

html5rocks.indexedDB.open = function() {
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
    request.onsuccess = function(e) {
        html5rocks.indexedDB.db = e.target.result;
        html5rocks.indexedDB.getAllRecords();
    };

    // 打开对象库失败时的回调函数
    request.onerror = html5rocks.indexedDB.onerror;
};

html5rocks.indexedDB.addTodo = function(todoText) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");
  var request = store.put({
    "text": todoText,
    "timeStamp" : new Date().getTime()
  });

  request.onsuccess = function(e) {
    // Re-render all the todo's
    html5rocks.indexedDB.getAllRecords();
  };

  request.onerror = function(e) {
    console.log(e.value);
  };
};

html5rocks.indexedDB.getAllRecords = function() {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    renderRecord(result.value);
    result.continue();
  };

  cursorRequest.onerror = html5rocks.indexedDB.onerror;
};

function renderRecord(row) {
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode(row.text);
  // t.data = row.text;

  a.addEventListener("click", function(e) {
    html5rocks.indexedDB.deleteTodo(row.timeStamp);
  });

  a.textContent = "[X]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li);
}

html5rocks.indexedDB.deleteTodo = function(id) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  var request = store.delete(id);

  request.onsuccess = function(e) {
    html5rocks.indexedDB.getAllRecords();  // Refresh the screen
  };

  request.onerror = function(e) {
    console.log(e);
  };
};

// 首页创建完成时需要触发的工作
$(document).on('pageinit', '#index', html5rocks.indexedDB.open);

$(document).on('pageinit', '#add_new', function() {
    $('#content').text('');
});

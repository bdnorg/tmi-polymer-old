window.tmi = {};
function log(message, level) {
  var logLevel=1;
  if(!level) { level = 1; }
  if (level >= logLevel) {
    console.log(message);
  }
}

/* --- tab / win management */

var browser = {
  focusOpenWindow: function(winId) {
    chrome.windows.update(winId, {focused: true});
  },
  selectOpenTab: function(winId, tabId) {
    chrome.tabs.update(tabId, {selected: true});
    app.browser.focusOpenWindow(winId);
  },
  // select a tabId
  selectOpenTabId: function(tabId) {
    chrome.tabs.update(tabId, {selected: true}, function (tempTab) {
      chrome.tabs.get(tabId, function(tab) {
        chrome.windows.update(tab.windowId, {focused: true}, function (tempWin) {
        });
      });
    });
  },
  tmiBookMarkRootId: '467',
  _genWinTitle: function(winNode) {
    var result = '('+ winNode.win.tabs.length +')';
    result += winNode.name || ' ';
    result += '['+ winNode.win.tabs[0].title +']';
    return result;
  },
  _bookmarkTabsRecurse: function(parentId, tabs, callback) {
    var tab = tabs.shift();
    var bm = {
      parentId: parentId,
      title: tab.title,
      url: tab.url,
    };
    if (tabs.length > 0) {
      chrome.bookmarks.create(bm ,function(){
        browser._bookmarkTabsRecurse(parentId, tabs, callback);
      });
    } else {
      chrome.bookmarks.create(bm, function(){ callback(); });
    }
  },
  bookmarkWinAndClose: function(winNode) {
    var bmFolder = {
      parentId: browser.tmiBookMarkRootId,
      title: browser._genWinTitle(winNode),
      index: 0
    };
    chrome.bookmarks.create(bmFolder, function(folder) {
      browser._bookmarkTabsRecurse(folder.id, winNode.win.tabs, function(){
        chrome.windows.remove(winNode.win.id);
      });
    });
  },
}; //end browser {}

var tree = {};

//should be [] if in an extension
tree.nodes = [];
tree.getNodes = function(){
  return tree.nodes;
};
tree.setNodes = function(nodes){
  tree.nodes = nodes;
};

tree.marks = {};
tree.getMarks = function(){
  return tree.marks;
};
tree.setMarks = function(marks){
  tree.marks = marks;
};

/*
--- freezing
*/
// New injection flow
// manifest to cause injectFreezer.js to be injected into: file:///?tmiFrozen*
// injectFreezer.js replaces body and head.  Then it does sendRequest of tmiFrozenPage.
// backgroundPage then injects code with frozen data.  The code modifies the DOM.
//chrome.extension.onMessage.addListener(

//var frozenTmiDb = Lawnchair({name: 'frozenTmiDb', adapter: 'webkit-sqlite'},function(obj){});
var tmiDb = Lawnchair({name: 'tmiDb', adapter: 'webkit-sqlite'},function(obj){
  console.log(obj);
});
var frozenTmiDb = tmiDb;

var TOTALFROZENTABS = 1000;
var frozenIndex = 0;

//Restore window variable to stored value.
// Otherwise create stored value based on window variable's value
function restoreFromLawnchair (key) {
  frozenTmiDb.get(key, function(obj){
    if (obj && obj.val) {
      window[key]=obj.val;
    } else {
      frozenTmiDb.save({key:key, val:window[key]}, function(){});
    }
  });
}
restoreFromLawnchair ('frozenIndex');

function freezeTab(tabId, callback){
  chrome.tabs.get(tabId, function (tabb){
    //don't freeze a frozen page
    if (tabb.url.indexOf('tmiFrozen') !== -1) {
      if(callback) {callback();}
      return false;
    }
    chrome.tabs.update(tabId, {active: true}, function (tab){
      chrome.tabs.captureVisibleTab(tab.windowId, function(dataUrl) {
        if(!dataUrl){console.log('Missing dataUrl. ', tab); }
        var frozenObj = {url: tab.url, title: 'Fz:' + tab.title, winId: tab.windowId, favIconUrl: tab.favIconUrl, dataUrl: dataUrl};

        var index = frozenIndex;
        frozenIndex = ++frozenIndex % TOTALFROZENTABS;
        frozenTmiDb.save({key:'frozenIndex', val:frozenIndex}, function(obj){
        });

        var key = 'frozenTabs' + index;
        frozenObj.Index = index;
        frozenObj.randName = Math.floor(Math.random()*100000000);
//        var frozenUrl = chrome.extension.getURL('frozen.html?');
        var frozenUrl = 'file:///?tmiFrozen&';
        frozenUrl += 'randName=' + frozenObj.randName;
        frozenUrl += '&frozenIndex=' + frozenObj.Index;
        frozenUrl += '&url=' + encodeURIComponent(tab.url);
        frozenTmiDb.save({key:key, val:frozenObj}, function(obj){
          chrome.tabs.update(tab.id, {url: frozenUrl}, function(tab){
            if(callback) {callback();}
          });
        });
      });
    });
  });
}

function freezeTabsRecurse(tabs, callback){
  if (tabs.length > 1) {
    var tab = tabs.shift();
    console.log('Tabs left to freeze: ', tabs.length);
    freezeTab(tab.id ,function(){freezeTabsRecurse(tabs, callback);});
  } else {
    freezeTab(tabs[0].id, function(){
      callback();
    });
  }
}
function freezeAllQuery(query, callback) {
  chrome.tabs.query(query, function(tabs){
    freezeTabsRecurse(tabs, callback);
  });
}
function freezeWindow(winId) {
  freezeAllQuery({pinned: false, windowType: 'normal', windowId: winId});
}
function freezeAllWindows(callback) {
  freezeAllQuery({pinned: false, windowType: 'normal'}, callback);
}

function freezeResponse(request, sender){
  frozenTmiDb.get('frozenTabs' + request.frozenIndex, function (obj){
    if (parseInt(request.randName) === obj.val.randName) {
      obj.val.name = 'tmiFrozenData';
//      obj.val.frozenIndex = request.frozenIndex;

//      injectFrozenData(sender.tab.id, obj.val);
//      sendResponse({injected: true});
      chrome.tabs.sendMessage(sender.tab.id, obj.val);
    }
//    sendResponse({injected: true});
//    return true;
  });
}

function doScheduledFreezePush(){
  tmi.isFreezeScheduled = false;
  var queueCopy = tmi.freezeQueue;
  tmi.freezeQueue = [];
  for (var i in queueCopy) {
    var request = queueCopy[i].request;
    var sender = queueCopy[i].sender;
    freezeResponse(request, sender);
  }
}

function enqueueFreezePush(request, sender){
  tmi.freezeQueue.push({request:request, sender:sender});
  if (! tmi.isFreezeScheduled){
    tmi.saveFreezeSchedule = setTimeout(doScheduledFreezePush, 200);
    tmi.isFreezeScheduled = true;
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name === 'tmiFrozenPage') {
//      freezeResponse(request, sender);
      enqueueFreezePush(request, sender);
    } else if (request.name === 'tmiExpandAll') {
    }
  }
);

window.tmi.freezeQueue = [];
window.tmi.isFreezeScheduled = false;


/* --- events */
// if anything changes, send an 'onWinChange' event

/*
function onWinChange(tabId, windowId, eventType) {
  chrome.runtime.sendMessage({id: 'onWinChange', tabId: tabId, winId: windowId, eventType: eventType});
  if(! windowId) {
    console.log('windowId undefined. eventType: ' + eventType + '. tabId: ' + tabId);
    return;
  }
}

// onCreated:
var winEvents = {
  onRemoved: function(windowId) {
    //t  nodes.deleteWinId(windowId);
    onWinChange(false, windowId, false);
  },
  onFocusChanged: function onWinFocusChanged(winId){
    //t  nodes.focusedTab();
    //chrome.tabs.query({lastFocusedWindow: true, active: true}, function(tabs){
    //      recentTabs.moveHead(tabs[0].id);
  }
};
for (var evType in winEvents) {
  chrome.windows[evType].addListener(winEvents[evType]);
}

//  onHighlighted:
//  onReplaced:
var tabEvents = {
  onCreated: function(tab) {
    onWinChange(tab.id, tab.windowId, 'onCreated');
  },
  onUpdated: function(tabId, info, tab) {
    onWinChange(tabId, tab.windowId, 'onTabupdated');
  },
  onMoved: function(tabId, info) {
    onWinChange(tabId, info.windowId, 'onMoved');
  },
  onActivated: function(info){
    //t  nodes.focusedTab();
  },
  onDetached: function(tabId, info) {
    onWinChange(tabId, info.oldWindowId, 'onDetached');
  },
  onAttached: function(tabId, info) {
    onWinChange(tabId, info.newWindowId, 'onAttached');
  },
  onRemoved: function(tabId, info) {
    //info.isWindowClosing -> ??
//    recentTabs.remove(tabId);
    onWinChange(tabId, info.windowId, 'onRemoved');
  }
};
for (var evType in tabEvents) {
  chrome.tabs[evType].addListener(tabEvents[evType]);
}
*/ //end commenting out events

/* --- newNewTab */
function newNewTab() {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, function(tab){
    chrome.tabs.create({openerTabId: tab.id, index: ++tab[0].index});
  });
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'newNewTab') {
    newNewTab();
//  } else if (command === 'togglePopUp') {
//    togglePopup();
  }
});


/* --- utils */
/* --- popup  */
/* -- linked list */
//var recentTabs = linkedList();

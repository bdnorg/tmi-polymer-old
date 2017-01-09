
console.log('In background.js');

window.tmi = window.tmi || {};
tmi.bg = tmi.bg || {};

//only exist locally if not already in tmi.bg
var browser = tmi.bg.browser || {};
var tree = tmi.bg.tree || {};
var fz = tmi.bg.fz || {};
var bgapp = tmi.bg.bgapp || {};

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


//should retrieve from storage
tree.nodes = tree.nodes || [];
tree.marks = tree.marks || {};
tree.getNodes = function(){
  return tree.nodes;
};
tree.setNodes = function(nodes){
  tree.nodes = nodes;
};
tree.getMarks = function(){
  return tree.marks;
};
tree.setMarks = function(marks){
  tree.marks = marks;
};
// end tree {}

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
fz.restoreFromLawnchair = function(key) {
  frozenTmiDb.get(key, function(obj){
    if (obj && obj.val) {
      window[key]=obj.val;
    } else {
      frozenTmiDb.save({key:key, val:window[key]}, function(){});
    }
  });
};
fz.restoreFromLawnchair ('frozenIndex');

fz.freezeTab = function(tabId, dataUrl, callback){
  chrome.tabs.get(tabId, function (tab){
    //don't freeze a frozen page
    if (tab.url.indexOf('tmiFrozen') !== -1) {
      if(callback) {callback();}
      return false;
    }
    //chrome.tabs.update(tabId, {active: true}, function (tab){
      //chrome.tabs.captureVisibleTab(tab.windowId, function(dataUrl) {
        if(!dataUrl){console.log('Missing dataUrl. ', tab); }
        var frozenObj = {url: tab.url, title: 'Fz:' + tab.title, winId: tab.windowId, favIconUrl: tab.favIconUrl, dataUrl: dataUrl};

        var index = frozenIndex;
        frozenIndex = ++frozenIndex % TOTALFROZENTABS;
        frozenTmiDb.save({key:'frozenIndex', val:frozenIndex}, function(obj){
        });

        var key = 'frozenTabs' + index;
        frozenObj.Index = index;
        frozenObj.randName = Math.floor(Math.random()*100000000);
        //var frozenUrl = chrome.extension.getURL('frozen.html?');
        var frozenUrl = 'file:///?tmiFrozen&';
        frozenUrl += 'randName=' + frozenObj.randName;
        frozenUrl += '&frozenIndex=' + frozenObj.Index;
        frozenUrl += '&url=' + encodeURIComponent(tab.url);
        frozenTmiDb.save({key:key, val:frozenObj}, function(obj){
          chrome.tabs.update(tab.id, {url: frozenUrl}, function(tab){
            if(callback) {callback();}
          });
        });
      //});
    //});
  });
};
fz.freezeTabWithThumbnail = function(tabId, callback){
  chrome.tabs.update(tabId, {active: true}, function (tab){
    chrome.tabs.captureVisibleTab(tab.windowId, function(dataUrl) {
      console.log('dataUrl', dataUrl);
      fz.freezeTab(tabId, dataUrl, callback);
    });
  });
};

fz._freezeTabsRecurse = function(tabs, callback){
  if (tabs.length > 1) {
    var tab = tabs.shift();
    console.log('Tabs left to freeze: ', tabs.length);
    fz.freezeTab(tab.id , '', function(){fz._freezeTabsRecurse(tabs, callback);});
  } else {
    fz.freezeTab(tabs[0].id, '', function(){
      callback();
    });
  }
};
fz._freezeAllQuery = function(query, callback) {
  chrome.tabs.query(query, function(tabs){
    fz._freezeTabsRecurse(tabs, callback);
  });
};
fz.freezeWindow = function(winId) {
  fz._freezeAllQuery({pinned: false, windowType: 'normal', windowId: winId});
};
fz.freezeAllWindows = function(callback) {
  fz._freezeAllQuery({pinned: false, windowType: 'normal'}, callback);
};

fz.freezeResponse = function(request, sender){
  frozenTmiDb.get('frozenTabs' + request.frozenIndex, function (obj){
    if (parseInt(request.randName) === obj.val.randName) {
      obj.val.name = 'tmiFrozenData';

      // obj.val.frozenIndex = request.frozenIndex;
      //
      // injectFrozenData(sender.tab.id, obj.val);
      // sendResponse({injected: true});
      chrome.tabs.sendMessage(sender.tab.id, obj.val);
    }
    // sendResponse({injected: true});
    // return true;
  });
};
fz.doScheduledFreezePush = function(){
  tmi.isFreezeScheduled = false;
  var queueCopy = tmi.freezeQueue;
  tmi.freezeQueue = [];
  for (var i in queueCopy) {
    var request = queueCopy[i].request;
    var sender = queueCopy[i].sender;
    fz.freezeResponse(request, sender);
  }
};
fz.enqueueFreezePush = function(request, sender){
  tmi.freezeQueue.push({request:request, sender:sender});
  if (! tmi.isFreezeScheduled){
    tmi.saveFreezeSchedule = setTimeout(fz.doScheduledFreezePush, 200);
    tmi.isFreezeScheduled = true;
  }
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name === 'tmiFrozenPage') {
      //fz.freezeResponse(request, sender);
      fz.enqueueFreezePush(request, sender);
    } else if (request.name === 'tmiExpandAll') {
    }
  }
);

window.tmi.freezeQueue = [];
window.tmi.isFreezeScheduled = false;


/* --- newNewTab */
var newNewTab = function () {
  chrome.tabs.query({lastFocusedWindow: true, active: true}, function(tab){
    chrome.tabs.create({openerTabId: tab.id, index: ++tab[0].index});
  });
};
chrome.commands.onCommand.addListener(function(command) {
  if (command === 'newNewTab') {
    newNewTab();
  // } else if (command === 'togglePopUp') {
  //   togglePopup();
  }
});

// bgapp

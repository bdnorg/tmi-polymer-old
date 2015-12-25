/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function (document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');


  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
    app.roott = document.querySelector('#main-tree');
    window.roott = app.roott;
    app.loadKeyMap();
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');

    // Ensure the drawer is hidden on desktop/tablet
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    drawerPanel.forceNarrow = true;
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

  app.keyClass = {
    tree: document.querySelector('#main-tree'),
    app: app,
  };

  app.getKeyStr = function(detail) {
    var shift = (detail.keyboardEvent.shiftKey ? 'shift+' : '') ;
    var ctrl = (detail.keyboardEvent.ctrlKey ? 'ctrl+' : '') ;
    var alt = (detail.keyboardEvent.altKey ? 'alt+' : '') ;
    return shift + ctrl + alt + detail.key ;
  };

  app.keyHandler = function(e, detail, sender) {
    console.log(sender);
    var key = app.getKeyStr(detail);
    console.log('key: ', key, app.keyOut[key], e);
    if (! app.keyOut[key]) { return; }
    var keyClass = app.keyOut[key][3];
    var func = app.keyOut[key][4];
    if (app.keyOut[key]) {
//      app.keyClass[class][func]();
      if (keyClass === 'tree') {
        app.roott[func]();
      } else {
        app[func]();
      }
    }
// ?: document.querySelector('paper-drawer-panel').togglePanel()
  };

  app.showHelp = function(){
   document.querySelector('paper-drawer-panel').togglePanel();
  };

  app.isEq = function(arg1, arg2){
    return arg1 === arg2;
  };

  app.loadKeyMap = function(){
// * Keys: [args, keys, desc, keyClass, func]
//      args: docHeader, doc, none, anyKey, global,
//        win, tab, pointer
    app.keyMap = [
    //tree movement
    ['docHeader', 'Tree movement', [
      ['doc', 'jkhl \u2190\u2191\u2192\u2193', 'movement'],
      ['doc', 'jkhl \u25C0\u25B2\u25BA\u25BC', 'movement'],
      ['none', 'j', '', 'tree', 'down'],
      ['none', 'k', '', 'tree', 'up'],
      ['none', 'h', '', 'tree', 'left'],
      ['none', 'l', '', 'tree', 'right'],
      ['doc', 'shift+ jk\u25B2\u25BC', 'move x 10'],
      ['none', 'shift+j', '', 'tree', 'downTen'],
      ['none', 'shift+k', '', 'tree', 'upTen'],
      ['none', '1 shift+g', 'move to top', 'tree', 'moveTop'],
      ['none', 'shift+g', 'move to bottom', 'tree', 'moveBottom'],
    ]],

    //nav wintabs
    ['docHeader', 'Nav wintabs', [
      ['pointerByType', 'enter', 'focus / open', 'tree', {
        'win': 'focusWin',
        'tab': 'focusTab',
        'closedTab': 'openClosedTab',
        'closedWin': 'openClosedWin',
      }],
      ['none', 'shift+o', '(un)pin window', 'tree', 'pin'],
      ['none', '/', 'search', 'tree', 'searchMode'],
      ['none', 'escape', 'clear search', 'tree', 'clearInput'],
      ['none', '\'', 'goto tag', 'tree', 'goMark'],
      ['none', 'm', 'mark tag', 'tree', 'mark'],
    ]],

//manage wintabs
    ['docHeader', 'Manage wintabs', [
      ['none', 'x', 'select node', 'tree', 'select'],
      ['none', 'shift+x', 'mark tabs to end of win', 'tree', 'markToEnd'],
      ['pointerByType', 'p', 'Paste/move marked tabs','tree', {
        'tab': 'putAfterTab',
        'win': 'putEndOfWin',
      }],
//      ['tab', 'p', '', 'putAfterTab'],
//      ['win', 'p', '', 'putEndOfWin'],
      ['none', 'P', 'marked tabs to new window', 'tree', 'putNewWin'],
      ['none', 'n', 'name window', 'tree', 'nameWin'],
      ['none', 'w s', 'mark Window to Save', 'tree', 'toSave'],
      ['none', 'w c', 'Close Window (keep node)', 'tree', 'closeWin'],
      ['none', 'w d', 'Window Delete (for closed)', 'tree', 'deleteWin'],
    ]],

//Freezing
    ['docHeader', 'Manage wintabs',[
      ['closed', 'F', 'Make Freezer (from closed)', 'tree', 'makeFreezer'],
      ['win', 'f b', 'Freeze to Bookmark', 'tree', 'bmFreeze'],
      ['key', 'f a', 'Freeze All non-pinned wins', 'tree', 'freezeAll'],
      ['tab', 'f f', 'Freeze calling tab', 'tree', 'freezeTab'],
    ]],

//Popup manage
    ['docHeader', 'Manage popup', [
      ['none', 'space', 'Show menu', 'app', 'showHelp'],
      ['none', 'q', 'close TMI', 'app', 'closeTmi'],
      ['none', 'r', 'Refresh', 'app', 'refreshTmi'],
      ['none', 'T', 'break point (for testing)', 'app', 'doBreakPoint'],
    ]],
//    ^a, ^z
  ];

    app.keyOut={};
//    for (let keyGroup of app.keyMap) {
    for (var i = 0; i < app.keyMap.length; i++) {
      var groupKeys = app.keyMap[i][2];
//      for (let keyRow of keyGroup[2]) {
      for (var j = 0; j < groupKeys.length; j++) {
        var keyRow = groupKeys[j];
        if(keyRow[0] !== 'docHeader' && keyRow[0] !== 'doc'){
          app.keyOut[keyRow[1]] = keyRow;
        }
      }
    }
  };
 
  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    console.log('ran app.scrollPateToTop()');
    //app.$.headerPanelMain.scrollToTop(true);
  };

})(document);

// TODO: Decide if we still want to suggest wrapping as it requires
// using webcomponents.min.js.
// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
// )(wrap(document));

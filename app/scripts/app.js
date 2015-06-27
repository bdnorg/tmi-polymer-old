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
    app.tree = document.querySelector('#main-tree');
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

  app.keyHandler = function(e, detail, sender) {
    var key = detail.key;
    var func = app.keyOut[key][3];
    console.log("key: ", key, app.keyOut[key], func);
    if (app.keyOut[key]) {
      app.tree[func]();
    };
  };

  app.isEq = function(arg1, arg2){
    return arg1 === arg2;
  }

  app.loadKeyMap = function(){
// * Keys: [args, keys, desc, func]
//      args: docHeader, doc, none, anyKey, global,
//        win, tab, pointer
    app.keyMap = [
    //tree movement
    ['docHeader', 'Tree movement'],
    ['doc', 'jkhl \u2190\u2191\u2192\u2193', 'movement'],
    ['doc', 'jkhl \u25C0\u25B2\u25BA\u25BC', 'movement'],
    ['none', 'j', '', 'down'],
    ['none', 'k', '', 'up'],
    ['none', 'h', '', 'left'],
    ['none', 'l', '', 'right'],
    ['doc', 'shift+ jk\u25B2\u25BC', 'move x 10'],
    ['none', 'shift+j', '', 'downTen'],
    ['none', 'shift+k', '', 'upTen'],
    ['none', '1 shift+g', 'move to top', 'moveTop'],
    ['none', 'shift+g', 'move to bottom', 'moveBottom'],

    //nav wintabs
    ['docHeader', 'Nav wintabs'],
    ['pointerByType', 'enter', 'focus / open', {
      'win': 'focusWin',
      'tab': 'focusTab',
      'closedTab': 'openClosedTab',
      'closedWin': 'openClosedWin',
    }],
    ['none', 'o', '(un)pin window', 'pin'],
    ['none', '/', 'search', 'searchMode'],
    ['none', 'escape', 'clear search', 'clearInput'],
    ['none', "'", "goto tag", 'goMark'],
    ['none', "m", "mark tag", 'mark'],

//manage wintabs
    ['docHeader', 'Manage wintabs'],
    ['none', 'x', 'select node', 'select'],
    ['none', 'shift+x', 'mark tabs to end of win', 'markToEnd'],
    ['pointerByType', 'p', 'Paste/move marked tabs',{
      'tab': 'putAfterTab',
      'win': 'putEndOfWin',
    }],
//    ['tab', 'p', '', 'putAfterTab'],
//    ['win', 'p', '', 'putEndOfWin'],
    ['none', 'P', 'marked tabs to new window', 'putNewWin'],
    ['none', 'n', 'name window', 'nameWin'],
    ['none', 'w s', 'mark Window to Save', 'toSave'],
    ['none', 'w c', 'Close Window (keep node)', 'closeWin'],
    ['none', 'w d', 'Window Delete (for closed)', 'deleteWin'],

//Freezing
    ['docHeader', 'Manage wintabs'],
    ['closed', 'F', 'Make Freezer (from closed)', 'makeFreezer'],
    ['win', 'f b', 'Freeze to Bookmark', 'bmFreeze'],
    ['key', 'f a', 'Freeze All non-pinned wins', 'freezeAll'],
    ['tab', 'f f', 'Freeze calling tab', 'freezeTab'],

//Popup manage
    ['docHeader', 'Manage popup'],
    ['none', 'T', 'break point (for testing)', 'doBreakPoint'],
    ['none', 'q', 'close TMI', 'closeTmi'],
    ['none', 'r', 'Refresh', 'refreshTmi'],
//    ^a, ^z
  ];

    app.keyOut={};
    for (var keyRow of keyMap) {
      if(keyRow[0] != 'docHeader' && keyRow[0] != 'doc'){
        app.keyOut[keyRow[1]] = keyRow;
      }
    }
  };


})(document);

// TODO: Decide if we still want to suggest wrapping as it requires
// using webcomponents.min.js.
// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
// )(wrap(document));

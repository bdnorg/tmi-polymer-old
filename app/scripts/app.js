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


  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
    app.roott = document.querySelector('#main-tree');
    app.roott = document.querySelector('#main-tree');
// bindAll fixes this for functions in keyMap.
    _.bindAll(app.roott, app.roott.methodNames);
    app.loadKeyMap();

    //for debugging
    window.roott = app.roott;
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

  app.showHelp = function(){
   document.querySelector('paper-drawer-panel').togglePanel();
  };

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    console.log('ran app.scrollPateToTop()');
    //app.$.headerPanelMain.scrollToTop(true);
  };

  app.loadKeyMap = function(){
// * Keys: [keys, desc, func]
//      args: docHeader, doc, none, anyKey, global,
//        win, tab, pointer
    app.keyMap = [
    //tree movement
    ['docHeader', 'Tree movement', [
      ['jkhl \u2190\u2191\u2192\u2193', 'movement', false],
      ['jkhl \u25C0\u25B2\u25BA\u25BC', 'movement', false],
// _bindAll allows this.  Just bindAll the arg to Polymer() ?
      ['j', false, app.roott.down ],
      ['k', false, app.roott.up],
      ['h', false, app.roott.left],
      ['l', false, app.roott.right],
      ['doc', 'shift+ jk\u25B2\u25BC', 'move x 10'],
//      ['J', false, app.roott.downTen],
//      ['K', false, app.roott.upTen],
      ['g', 'move to top win/tab', app.roott.setPointerToTop],
      ['G', 'move to bottom win/tab', app.roott.setPointerToBottom],
    ]],

    //nav wintabs
    ['docHeader', 'Nav wintabs', [
      ['enter', 'focus / open', app.roott.branchPointerWrap({
           tab: tmi.bg.browser.selectOpenTabId,
           win: tmi.bg.browser.focusOpenWindow,
         })
      ],
      ['o', '(un)pin window', app.roott.pin],
      ['/', 'search', function(e){app.roott.searchMode(e);} ],
      ['esc', 'search', function(e){app.clearSearch(e);} ],
      ['\'', 'goto tag', app.roott.goMark],
      ['m', 'mark tag', app.roott.mark],
    ]],

//manage wintabs
    ['docHeader', 'Manage wintabs', [
      ['x', 'select node', app.roott.selectPointer],
      ['X', 'select tabs to end of win', app.roott.selectToEnd],
      ['p', 'paste selected after pointer', app.roott.putAtPointer],
      ['P', 'selected to', app.roott.putInNewWin],
      ['n', 'name window', app.roott.nameWin],
      ['w s', 'mark Window to Save', app.roott.toSave],
      ['w c', 'Close Window (keep node)', app.roott.closeWin],
      ['w d', 'Window Delete (for closed)', app.roott.deleteWin],
    ]],

//Freezing (acts on current rather than pointer)
    ['docHeader', 'Manage wintabs',[
      ['f f', 'Freeze calling tab', app.roott.freezeCurrentTab],
      ['f p', 'Freeze pointer', app.roott.branchPointerWrap({
           tab: tmi.bg.freezeTab,
           win: tmi.bg.freezeWindow,
         })
      ],
      ['f w', 'Freeze window non-pinned tabs', app.roott.freezeWindow],
      ['f a', 'Freeze ALL non-pinned tabs', app.roott.freezeAll],
//      ['f b', 'Freeze to Bookmark', app.roott.bmFreeze],
//      ['F', 'Make Freezer (from closed)', app.roott.makeFreezer],
    ]],

//Popup manage
    ['docHeader', 'Manage popup', [
      ['?', 'Show menu', app.showHelp],
      ['q', 'close TMI', app.roott.closeTmi],
      ['r', 'Refresh', app.roott.refreshTmi],
      ['T', 'break point (for testing)', app.roott.doBreakPoint],
    ]],
  ];

    app.makeHandler = function(func) {
      return function(e){
        e.stopPropagation();
        e.preventDefault();
        func();
      };
    };

    app.keyOut={};
    for (var i = 0; i < app.keyMap.length; i++) {
      var sectionRows = app.keyMap[i][2];
      for (var j = 0; j < sectionRows.length; j++) {
        var keyRow = sectionRows[j];
        if(keyRow[2]){
//          app.keyOut[keyRow[0]] = keyRow[2];
//          Mousetrap.bind(keyRow[0], keyRow[2]);
          var keyHandler = app.makeHandler(keyRow[2]);
          Mousetrap.bind(keyRow[0], keyHandler);
        }
      }
    }

    var menu = document.querySelector('tmi-menu');
    menu.keyMap = app.keyMap;
    var searchBox = document.querySelector('#searchBox');
    var searchKey = new Mousetrap(searchBox);
    app.clearSearch = function(e){
      e.preventDefault();
      app.searchstr = '';
      app.roott.hideAll();
      app.roott.clearSelected();
      searchBox.blur();
    };
    searchKey.bind('esc', app.clearSearch);
    searchKey.bind('return', function(e){
      searchBox.blur();
    });

  }; // end loadKeyMap


})(document);

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
  //var app = document.querySelector('#app');
  window.app = window.app || {};
  console.log('LC: app.js');

  window.onload = function() {
    console.log('LC: window.onload event');
  };
  document.addEventListener('DOMContentLoaded', function(event) {
    console.log('LC: DOMContentLoaded event');
  });
  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
//  app.addEventListener('dom-change', function() {
//    console.log('LC: dom-change event');
//  });
  app.init = function() {
    console.log('App ready!');
    app.roott = document.querySelector('#tmiTree');
    _.bindAll(app.roott, app.roott.methodNames);

    app.loadKeyMap();

    //for debugging
    window.roott = app.roott;
  };

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    console.log('LC: WebComponentsReady event');

    Polymer.dom.flush();
    app.roott.scrollToEl(app.roott.getPointer());
    document.querySelector('body').removeAttribute('unresolved');

    // Ensure the drawer is hidden on desktop/tablet
//    var drawerPanel = document.querySelector('#paperDrawerPanel');
    var drawerPanel = app.roott.$$('#paperDrawerPanel');
    drawerPanel.forceNarrow = true;
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
//    var drawerPanel = document.querySelector('#paperDrawerPanel');
    var drawerPanel = app.$$('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

  app.showHelp = function(){
//   document.querySelector('paper-drawer-panel').togglePanel();
   app.$$('paper-drawer-panel').togglePanel();
  };

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    console.log('ran app.scrollPageToTop()');
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
//      ['jkhl \u25C0\u25B2\u25BA\u25BC', 'movement', false],
// _bindAll allows this.  Just bindAll the arg to Polymer() ?
      ['j', false, app.roott.down ],
      ['down', false, app.roott.down ],
      ['k', false, app.roott.up],
      ['up', false, app.roott.up],
      ['h', false, app.roott.left],
      ['left', false, app.roott.left],
      ['l', false, app.roott.right],
      ['right', false, app.roott.right],
      ['shift+up/down', 'move bottom/top', false],
      ['G/g', 'move to bottom/top', false],
//      ['J', false, app.roott.downTen],
//      ['K', false, app.roott.upTen],
      ['J', false, app.roott.setPointerToBottom],
      ['shift+down', false, app.roott.setPointerToBottom],
      ['K', false, app.roott.setPointerToTop],
      ['shift+up', false, app.roott.setPointerToTop],
      ['G', false, app.roott.setPointerToBottom],
      ['g', false, app.roott.setPointerToTop],
    ]],

    //nav wintabs
    ['docHeader', 'Navigate', [
      ['enter', 'focus / open', app.roott.focusPointer],
      ['o', '(un)pin window', app.roott.pin],
      ['/', 'search', function(e){app.roott.searchMode(e);} ],
//      ['esc', 'Suspend search', function(e){app.clearSearch(e);} ],
      ['esc', 'Suspend search', false ],
      ['\'', 'goto mark', app.roott.goMark],
      ['m', 'create mark', app.roott.mark],
      ['m DEL', 'delete mark', false],
      ['0-9', 'fast goto', false],
      ['1', false, () => app.roott.focusMark('1') ],
      ['2', false, () => app.roott.focusMark('2') ],
      ['3', false, () => app.roott.focusMark('3') ],
      ['4', false, () => app.roott.focusMark('4') ],
      ['5', false, () => app.roott.focusMark('5') ],
      ['6', false, () => app.roott.focusMark('6') ],
      ['7', false, () => app.roott.focusMark('7') ],
      ['8', false, () => app.roott.focusMark('8') ],
      ['9', false, () => app.roott.focusMark('9') ],
      ['0', false, () => app.roott.focusMark('0') ],
    ]],

//manage wintabs
    ['docHeader', 'Arrange', [
      ['x', 'select node', app.roott.selectPointer],
      ['X', 'select tabs to end of win', app.roott.selectToEnd],
      ['p', 'paste selected after pointer', app.roott.putAtPointer],
      ['P', 'selected to new win', () => app.roott.putInNewWin('') ],
      ['y', 'move pointer to mark (new win)', app.roott.moveToTag],
    ]],

//Freezing (acts on current rather than pointer)
    ['docHeader', 'Store',[
      ['n', 'name window', app.roott.nameWin],
      ['w b', 'Bookmark and close Window', app.roott.bookmarkCloseWin],
//      ['w s', 'mark Window to Save', app.roott.toSave],
//      ['w c', 'Close Window (keep node)', app.roott.closeWin],
//      ['w d', 'Window Delete (for closed)', app.roott.deleteWin],
      ['f f', 'Freeze calling tab', app.roott.freezeCurrentTab],
      ['f p', 'Freeze pointer', app.roott.branchPointerWrap({
           tab: tmi.bg.freezeTab,
           win: tmi.bg.freezeWindow,
         })
      ],
      ['f w', 'Freeze win (non-pinned)', app.roott.freezeWindow],
      ['f a', 'Freeze ALL (non-pinned)', app.roott.freezeAll],
//      ['f b', 'Freeze to Bookmark', app.roott.bmFreeze],
//      ['F', 'Make Freezer (from closed)', app.roott.makeFreezer],
    ]],

//Popup manage
    ['docHeader', 'Manage popup', [
      ['?', 'toggle menu', app.showHelp],
      ['alt-a', 'toggle popup', app.roott.closeTmi],
//      ['r', 'Refresh', app.roott.refreshTmi],
//      ['T', 'break point (for testing)', app.roott.doBreakPoint],
    ]],
  ];

//    var menu = document.querySelector('tmi-menu');
    var menu = app.roott.$$('tmi-menu');
    menu.keyMap = app.keyMap;
//    var searchBox = document.querySelector('#searchBox');
    var searchBox = app.roott.$$('#searchBox');

    app.makeHandler = function(func) {
      return function(e, combo){
        if (app.roott.inputMode) {
          if (combo === 'esc') {
            app.blurSearch(e);
          } else if (combo === 'enter') {
            app.blurSearch(e);
          }
          return;
        }
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
          var keyHandler = app.makeHandler(keyRow[2]);
          Mousetrap.bind(keyRow[0], keyHandler);
        }
      }
    }

    app.clearSearch = function(e){
      e.preventDefault();
      app.searchstr = '';
      app.roott.hideAll();
      app.roott.setPointerToCurrentWin();
      app.roott.clearSelected();
      searchBox.blur();
    };
    app.blurSearch = function(e) {
      searchBox.blur();
      app.roott.inputMode = false;
    };
    var searchKey = new Mousetrap(searchBox);
    searchKey.bind('esc', app.blurSearch);
    searchKey.bind('enter', app.blurSearch);

  }; // end loadKeyMap

  app.redrawTree = function() {
//    app.roott = document.querySelector('#tmiTree');
    document.body.removeChild(app.roott);
    app.drawTree();
  };
  app.drawTree = function() {
    console.log('drawTree');
    var newTree = document.createElement('tmi-tree');
    newTree.setAttribute('id','tmiTree');
    document.body.appendChild(newTree);
    app.init();
  };

  app.drawTree();
})(document);

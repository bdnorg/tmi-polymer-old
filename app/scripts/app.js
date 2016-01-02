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
//    _.bindAll(app.roott);  //binds everything
// just binds functions defined in tmi-tree
//    var roottMethods = _.select(app.roott.polymerObjKeys, function(n){
//                         return _.isFunction(app.roott[n]); });
//    _.bindAll(app.roott, roottMethods);
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
//      ['j', false, function(){app.roott.down();} ],
      ['k', false, function(){app.roott.up();} ],
      ['h', false, function(){app.roott.left();} ],
      ['l', false, function(){app.roott.right();} ],
      ['doc', 'shift+ jk\u25B2\u25BC', 'move x 10'],
      ['shift+j', false, function(){app.roott.downTen();} ],
      ['shift+k', false, function(){app.roott.upTen();} ],
      ['1 shift+g', 'move to top', function(){app.roott.moveTop();} ],
      ['shift+g', 'move to bottom', function(){app.roott.moveBottom();}],
    ]],

    //nav wintabs
    ['docHeader', 'Nav wintabs', [
      ['enter', 'focus / open', app.roott.branchOnNodeType({
           tab: tmi.bg.browser.selectOpenTabId,
           win: tmi.bg.browser.focusOpenWindow,
         }) 
      ],
      ['shift+o', '(un)pin window', function(){app.roott.pin();} ],
      ['/', 'search', function(e){app.roott.searchMode(e);} ],
      ['esc', 'search', function(e){app.clearSearch(e);} ],
      ['\'', 'goto tag', function(){app.roott.goMark();} ],
      ['m', 'mark tag', function(){app.roott.mark();} ],
    ]],

//manage wintabs
    ['docHeader', 'Manage wintabs', [
      ['x', 'select node', function(){app.roott.select();} ],
      ['shift+x', 'mark tabs to end of win', function(){app.roott.markToEnd();} ],
      ['p', 'paste after point', function(){app.roott.putAfterTab();} ],
      ['P', 'marked tabs to new window', function(){app.roott.putNewWin();} ],
      ['n', 'name window', function(){app.roott.nameWin();} ],
      ['w s', 'mark Window to Save', function(){app.roott.toSave();} ],
      ['w c', 'Close Window (keep node)', function(){app.roott.closeWin();} ],
      ['w d', 'Window Delete (for closed)', function(){app.roott.deleteWin();}],
    ]],

//Freezing
    ['docHeader', 'Manage wintabs',[
      ['f', 'Freeze tab/win', app.roott.branchOnNodeType({
           tab: tmi.bg.freezeTab,
           win: tmi.bg.freezeWindow,
         }) 
      ],
      ['shift+f', 'Freezer all', function() {tmi.bg.freezeAllWindows();}],
//      ['F', 'Make Freezer (from closed)', function(){app.roott.makeFreezer();} ],
      ['f b', 'Freeze to Bookmark', function(){app.roott.bmFreeze();} ],
      ['f a', 'Freeze All non-pinned wins', function(){app.roott.freezeAll();} ],
      ['f f', 'Freeze calling tab', function(){app.roott.freezeTab();} ],
    ]],

//Popup manage
    ['docHeader', 'Manage popup', [
      ['?', 'Show menu', function(){app.showHelp();} ],
      ['q', 'close TMI', function(){app.roott.closeTmi();} ],
      ['r', 'Refresh', function(){app.roott.refreshTmi();} ],
      ['T', 'break point (for testing)', function(){app.roott.doBreakPoint();} ],
    ]],
  ];

    app.keyOut={};
    for (var i = 0; i < app.keyMap.length; i++) {
      var sectionRows = app.keyMap[i][2];
      for (var j = 0; j < sectionRows.length; j++) {
        var keyRow = sectionRows[j];
        if(keyRow[2]){
//          app.keyOut[keyRow[0]] = keyRow[2];
          Mousetrap.bind(keyRow[0], keyRow[2]);
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
      searchBox.blur(); 
    };
    searchKey.bind('esc', app.clearSearch);
    searchKey.bind('return', function(e){ 
      searchBox.blur(); 
    });

  }; // end loadKeyMap


})(document);



window.Polymer = window.Polymer || {};
window.Polymer.dom = 'shadow';

window.tmi = window.tmi || {};

tmi.loadScript = function(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
};


if (chrome.extension) {  //in extension context
  tmi.bg = chrome.extension.getBackgroundPage();
  tmi.chrome = {};
  tmi.chrome.tabs = chrome.tabs;
  tmi.chrome.windows = chrome.windows;
  tmi.chrome.extension = chrome.extension;

} else { //no extension context: make mocks

  tmi.mockLog = function() {
    console.log('Mock. This: ', this, 'Args: ', arguments);
  };
  tmi.makeMocks = function(funcNames) {
    var result = {};
    for(var i=0; i < funcNames.length; i++){
      result[ funcNames[i] ] = tmi.mockLog;
    }
    return result;
//  return _.zipObject(funcNames, [...]);
  };

  tmi.testDataCallBack = function(){
    tmi.bg = {};
    tmi.bg.browser = {
      selectOpenTabId: tmi.mockLog,
      focusOpenWindow: tmi.mockLog,
    };
    tmi.bg.tree = {
      nodes: [
        {id: 'id-deleted', winId: 999999, hash: 1},  // should get deleted
        {id: 'id-10', winId: 10, hash: 0},
        {id: 'id-1', winId: 1, hash: 0, state: 'save'},
        {id: 'id-2', winId: 2, hash: 0},
        {id: 'id-9', winId: 9, hash: 0},
        {id: 'id-3', winId: 3, hash: 0},
      ],

      getNodes: function() {
        return tmi.bg.tree.nodes;
      },
      setNodes: function(nodes){
        tmi.bg.tree.nodes = nodes;
      },
    };
    tmi.chrome = {};
    tmi.chrome.tabs = tmi.makeMocks(['get', 'update', 'query', 'sendMessage', 'create', 'captureVisibleTab']);
    tmi.chrome.windows = tmi.makeMocks(['get', 'update', 'getCurrent']);

    tmi.testWinsIndex = _.indexBy(tmi.testWins, 'id');
    tmi.chrome.windows.getCurrent = function(func){
      setTimeout(func(tmi.testWinsIndex[6]), 0);
    };
    tmi.chrome.windows.getAll = function(config, func){
      //should detect number of args
      setTimeout(func(tmi.testWins), 0);
    };
  }; // end tmi.testDataCallBack: function(){

  tmi.loadScript('../test/chrome.windows.test.data.js', tmi.testDataCallBack);

} //end if (chrome.extension)
  
  


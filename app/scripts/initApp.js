
window.Polymer = window.Polymer || {};
window.Polymer.dom = 'shadow';

window.tmi = window.tmi || {};
tmi.mockLog = function() {
  console.log('Mock. This: ', this, 'Args: ', arguments);
};
tmi.makeMocks = function(funcNames) {
  var result = {};
  for(var i=0; i < funcNames.length; i++){
    result[ funcNames[i] ] = tmi.mockLog;
  }
  return result;
//  return _zipObject(funcNames, [...]);
};

if (chrome.extension) {  //in extension context
  tmi.bg = chrome.extension.getBackgroundPage();
  tmi.chrome = {};
  tmi.chrome.tabs = chrome.tabs;
  tmi.chrome.windows = chrome.windows;
  tmi.chrome.extension = chrome.extension;

} else { //no extension context: make mocks

  tmi.bg = {};
  tmi.bg.browser = {
    selectOpenTabId: tmi.mockLog,
    focusOpenWindow: tmi.mockLog,
  };
  tmi.bg.tree = {
    nodes: [
      {id: 'id-1103', winId: 1103, hash: 1, state: 'save'},
      {id: 'id-1', winId: 1, hash: 2},
      {id: 'id-565', winId: 565, hash: 3},
      {id: 'id-678', winId: 678, hash: 4},
      {id: 'id-883', winId: 883, hash: 5},
      {id: 'id-6666', winId: 6666, hash: 6666},  //should get deleted
//      {id: 'id-1061'},
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
    setTimeout(func(tmi.testWinsIndex[565]), 0);
  };
  tmi.chrome.windows.getAll = function(config, func){
    //should detect number of args
    setTimeout(func(tmi.testWins), 0);
  };

} //end if (chrome.extension)
  
  


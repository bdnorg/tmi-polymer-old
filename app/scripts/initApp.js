
console.log('LC: initApp.js');
window.Polymer = window.Polymer || {};
window.Polymer.dom = 'shadow';

window.tmi = window.tmi || {};

tmi.initExtension = function(){
  tmi.bg = chrome.extension.getBackgroundPage();
  tmi.chrome = {};
  tmi.chrome.tabs = chrome.tabs;
  tmi.chrome.windows = chrome.windows;
  tmi.chrome.extension = chrome.extension;

};
tmi.initMockExtension = function() {
  console.log('in initApp.js tmi.initMockExtension');

  tmi.mockLog = function() {
    console.log('Mock This: ', this, 'Args: ', arguments);
  };
  tmi.makeMocks = function(funcNames) {
    var result = {};
    for(var i=0; i < funcNames.length; i++){
      result[ funcNames[i] ] = tmi.mockLog;
    }
    return result;
//  return _.zipObject(funcNames, [...]);
  };
  tmi.loadScript = function(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    head.appendChild(script);
  };
  tmi.loadHtml = function(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var linkEl = document.createElement('link');
    linkEl.setAttribute('rel', 'import');
    linkEl.setAttribute('href', url);
    linkEl.onload = callback;
    head.appendChild(linkEl);
  };
  tmi.time = function(func, label) {
    var start = performance.now();
    func();
    var end = performance.now();
    console.log(label, ': time:', end - start, ' ms.');
  };

  tmi.bg = {};
  tmi.bg.browser = {
    selectOpenTabId: tmi.mockLog,
    focusOpenWindow: tmi.mockLog,
  };
  window.chrome = window.chrome || {};
  chrome.runtime = chrome.runtime || {};
  chrome.runtime.onMessage = tmi.makeMocks(['addListener']);
  chrome.commands = chrome.commands || {};
  chrome.commands.onCommand = tmi.makeMocks(['addListener']);

  tmi.chrome = {};
  tmi.chrome.tabs = tmi.makeMocks(['get', 'update', 'sendMessage', 'create', 'captureVisibleTab']);
  tmi.chrome.windows = tmi.makeMocks(['get', 'update', 'getCurrent']);

  tmi.bgCallBack = function (){
    tmi.bg.tree = tmi.bg.tree || {};
    tmi.bg.tree.nodes = [
        {id: 'id-deleted', winId: 999999, hash: 1},  // should get deleted
        {id: 'id-10', winId: 10, hash: 0},
        {id: 'id-1', winId: 1, hash: 0, state: 'save'},
        {id: 'id-2', winId: 2, hash: 0, name: 'Name id-2'},
        {id: 'id-9', winId: 9, hash: 0, name: 'Name id-9'},
        {id: 'id-3', winId: 3, hash: 0},
      ];

    tmi.bg.tree.marks = {'id-3': 'z', 'id-604': '4'};

    tmi.testWinsIndex = _.indexBy(tmi.testWins, 'id');
    tmi.chrome.windows.getCurrent = function(func){
      console.log('Mock tmi.chrome.windows.getCurrent');
      setTimeout(func(tmi.testWinsIndex[6]), 0);
    };
    tmi.chrome.windows.getAll = function(config, func){
      console.log('Mock tmi.chrome.windows.getAll: ', config);
      //should detect number of args
      setTimeout(func(tmi.testWins), 0);
    };
    tmi.chrome.tabs.query = function(obj, func){
      console.log('Mock tmi.chrome.tabs.query: ', obj);
      //fake results of obj = {active: true, currentWindow: true}
      var results = [tmi.testWinsIndex[6].tabs[1]];
      setTimeout(func(results), 0);
      //      setTimeout(func([tmi.testWinsIndex[12].tabs[42]]), 0);
    };

  }; // end tmi.bgCallBack

  tmi.testDataCallBack = function(){
    tmi.loadHtml('/background.html', tmi.bgCallBack);
  };
  tmi.loadScript('/scripts/chrome.windows.test.data.js', tmi.testDataCallBack);

}; //end tmi.initMockExtension


// Main
if (chrome.extension) {  //in extension context
  tmi.initExtension();
} else { //no extension context: make mocks
  tmi.initMockExtension();
}

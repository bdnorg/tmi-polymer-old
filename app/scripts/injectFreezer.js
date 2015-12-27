/*jshint multistr: true */
document.head.innerHTML= '     \
<title>Fzzz: Stale Image: (refresh or unfreeze).</title>     \
<link id="favicon" rel="shortcut icon" type="image/png" />     \
<style type="text/css">     \
#grayout{     \
  background-color: lightblue;     \
  float: left;     \
}     \
#opacity{     \
  opacity : 0.5;     \
}     \
</style>     \
';

var qsParm = [];
function qs() {
  var query = window.location.search.substring(1);
  var parms = query.split('&');
  for (var i=0; i<parms.length; i++) {
    var pos = parms[i].indexOf('=');
    if (pos > 0) {
      var key = parms[i].substring(0,pos);
      var val = parms[i].substring(pos+1);
      qsParm[key] = val;
    }
  }
}
qsParm.frozenIndex=qsParm.randName=qsParm.url=qsParm.node=qsParm.title='';
qs();



function cellarInit(){
  document.body.innerHTML= '     \
  <div style="background-color:lightblue;white-space:nowrap;font-size:16pt">     \
    <div style="width:100%;text-align:center" id="title"></div>     \
    Freezer (TMI cellar window)  \
    <span id="controls"></span>  \
  </div>  \
  <iframe width="100%" height="800px" id="iframeId" src=""> </iframe>  \
  ';
//    <button onclick="injected.expandAll()">Expand all</button>  \
  var el = document.getElementById('iframeId');
  el.src='chrome-extension://fminikkbmmmedpebebmpklbkgbnhjmde/freezer.html?node=' + qsParm.node;

  var title = decodeURIComponent(qsParm.title);
  document.title = title;
  el = document.getElementById('title');
  el.innerHTML = '<b>Title:</b> ' + title;

  var elemm = document.createElement('BUTTON');
  elemm.innerHTML = 'Expand All';
  elemm.id = 'buttonId';
  document.getElementById('controls').appendChild(elemm);
  elemm.onclick = function() {
    console.log('Expanding All');
    chrome.runtime.sendMessage({name: 'tmiExpandAll', node: qsParm.node });
  };
} //end cellarInit()




function frozenInit(){
/*jshint multistr: true */
document.body.innerHTML= '     \
<div style="background-color:lightblue;white-space:nowrap;font-size:16pt">     \
<div style="width:100%;text-align:center" id="title"></div>     \
<a href="" id="unfreeze" >Unfreeze</a>     \
</div>     \
<span id="thisUrl"></span>     \
<hr>     \
<a href="" id="unfreezeImg" >     \
<div id="grayout">     \
  <div id="opacity">     \
    <img id=frozenImg style="width: 100%" src="">     \
  </div>     \
</div>     \
</a>     \
';
function decode(param) {
  var str = decodeURIComponent(param);
  str = str.replace(/\+/g, ' ');
  return str;
}

//Modify DOM from URL params.  No need to wait for injected code.
var frozenUrl = decode(qsParm.url);
var el = document.getElementById('unfreeze');
el.href = frozenUrl;
el.innerHTML = '<b>Unfreeze:</b> <font size=-3>' + frozenUrl + '</font>';
el = document.getElementById('unfreezeImg');
el.href = frozenUrl;


function updateDomWithFrozenState(response){
  console.log('response: ', response);
  var el=document.getElementById('favicon');
  el.href = response.favIconUrl;
  el = document.getElementById('title');
  document.title = response.title;
  el.innerHTML = '<b>Title:</b> ' + response.title;
  el = document.getElementById('frozenImg');
  el.src = response.dataUrl;
}

function handleResponse(response, sender){
  if (response.name === 'tmiFrozenData' || response.dataUrl){
    updateDomWithFrozenState(response);
    window.onfocus = null;
    clearTimeout(window.messageTimer);
  }
}
chrome.runtime.onMessage.addListener(handleResponse);

function requestData(){
  chrome.runtime.sendMessage({name: 'tmiFrozenPage', frozenIndex: decode(qsParm.frozenIndex), randName: decode(qsParm.randName) });
}
requestData();
window.messageTimer = setTimeout(requestData, 600000);

// if data failed to get sent, this will grab it on focus.  Success will clear this function.
window.onfocus = function () {
  requestData();
};

} //end frozenInit()

/*
window.messageTimer=null;
window.interval = 1000;
// handle the frozen data
function handleResponse(response, sender){
  clearTimeout(messageTimer);
  updateDomWithFrozenState(response);
}
chrome.runtime.onMessage.addListener(handleResponse);

// send request to backgroundPage to send the frozen data
function requestData(){
  chrome.runtime.sendMessage({name: 'tmiFrozenPage', frozenIndex: decode(qsParm['frozenIndex']), randName: decode(qsParm['randName']) });
}
function requestDataWithBackoff() {
  requestData();
  if (interval >= 600000) { return false; }
  messageTimer = setTimeout(requestDataWithBackoff, interval);
  interval *= 2;
}
requestDataWithBackoff();
*/

if (qsParm.node) {
  cellarInit();
} else {
  frozenInit();
}


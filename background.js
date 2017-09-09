function loadScript(scriptName, callback) {
    var scriptEl = document.createElement('script');
    scriptEl.src = chrome.extension.getURL(scriptName + '.js');
    scriptEl.addEventListener('load', callback, false);
    document.head.appendChild(scriptEl);
}

loadScript('popup');
loadScript('jquery.min')
chrome.alarms.onAlarm.addListener(function(alarm) {
	console.log('Alarm running');
	postUsrHeartbeat();
});
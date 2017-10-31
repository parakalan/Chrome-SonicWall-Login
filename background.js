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

chrome.webRequest.onErrorOccurred.addListener(function(details) {
        $('.loader').hide();
        if (details.error == "net::ERR_INSECURE_RESPONSE")
        {
            $('.info').html("Chrome's Insecure Reponse. Go to https://192.168.20.1 and select proceed anyway");
        }
        else if(details.error == "net::ERR_ADDRESS_UNREACHABLE")
        {
            $('.info').html("You're not connected to HP / NITT Wifi.");

        }
    },
    {
        urls: ['*://*/*'],
        types: ['xmlhttprequest']
});
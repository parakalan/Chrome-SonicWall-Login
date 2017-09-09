BASE_URL = 'https://192.168.20.1'

function init() {
	if (localStorage.getItem('username') == null) {
		$('.login-page').show();
		$('.loader').hide();
	}
	else {
		getHtml();
	}
}

function saveDetails() {

	localStorage.setItem('username', $('#username').val());
	localStorage.setItem('password', $('#password').val());
	getHtml();
}

function isLoggedIn(str) {
	if(str.indexOf('refresh=true') == -1) {
		$('#logged_in').show();
		$('.loader').hide();
		$('.login-page').hide();
		$('.info').html("");
		if(localStorage.getItem('username') == null)
			init();
	}
	else {
		$('.info').html("");
		init();	
	}
}

var alarmName = "persistantLogin";

function checkAlarm(callback) {
	chrome.alarms.getAll(function(alarms) {
		var hasAlarm = alarms.some(function(a) {
			return a.name == alarmName;
		});
		if (!hasAlarm) {
		 alarmClock.setup();
		}
	});
}

var alarmClock = {
		onHandler : function(e) {
			chrome.alarms.create(alarmName, {delayInMinutes: 0, periodInMinutes: 30} );
		},
		setup: function() {
			alarmClock.onHandler();
		}
};

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("save").addEventListener("click", saveDetails);
	postUsrHeartbeat();
	checkAlarm();
}, false);

function getChars(str)
{
	var buf = new Array();
	var uriStr = encodeURI(str);
	var count = 0;

	for (var i = 0; i < uriStr.length; i++,count++)
	{
		if(uriStr.charAt(i)=='%')
		{
			buf[count]=parseInt(uriStr.substr(i+1,2),16);
			i+=2;
		}
		else
		{
			buf[count] = uriStr.charCodeAt(i);
		}
	}
	return buf;
}

function setEncryptSeed(strPassPhrase, randomNumber) {
	var strInternalPageSeedHash = new String();
	if (strPassPhrase.length > 0) {
		strInternalPageSeedHash = calcMD5_2(getChars(randomNumber + strPassPhrase));
		return strInternalPageSeedHash;
	}
}

function authenticate(d) {
	var username = localStorage.getItem('username');
	var password = localStorage.getItem('password');

	var route = "/auth.cgi";
	var method = "POST";
	setCookie(d.sessId, password, d.param2);

	var data = {
			'uName' : username,
			'pass' : password,
			'sessId' : d.sessId,
			'param1' : d.param1,
			'param2' : d.param2,
			'id ': d.id
		}
	var str = []
	for(var p in data)
		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
	str = str.join('&');
	var request = $.ajax({
		url : BASE_URL+route,
		processData: false,
		contentType: false,
		method : method,
		data : str,
		xhrFields : {
			withCredentials : true
		},
		headers : {
			"referrer" : "https://192.168.20.1/auth1.html",
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});

	request.done(function(data){
		if(data.indexOf("top.location.href = 'auth.html'") !== -1) {
			$('.loader').hide();
			$('.info').html('<center>Wrong credentials</center>');
			$('.login-page').show();
		}
		else
			getLoginStatus();
	});
}

function getHtml() {
	var route = "/auth1.html";
	var method = "GET";

	var request = $.ajax({
		url : BASE_URL+route,
		method : method
	});

	request.done(function(data){
		html = $.parseHTML(data);
		var d = {
			"param1" : "",
			"param2" : html[26].elements.param2.value,
			"sessId" : html[26].elements.sessId.value,
			"id" : html[26].elements.id.value
		}
		authenticate(d);
	});
}

function getLoginStatus() {
	var route = "/loginStatusTop(eng).html";
	var method = "GET";

	var request = $.ajax({
		url : BASE_URL+route,
		method : method
	});

	request.done(function(data){
		console.log(data);
		postUsrHeartbeat();
	});
}

function postUsrHeartbeat() {
	var route = "/usrHeartbeat.cgi";
	var method = "POST";

	var request = $.ajax({
		url : BASE_URL+route,
		method : method
	});

	request.done(function(data){
		isLoggedIn(data);
	});
}

function setCookie(SessId, password, param2){
	chrome.cookies.set({"name":"SessId","url":"https://192.168.20.1","value":SessId},function (cookie){
		//console.log(JSON.stringify(cookie));
		//console.log(chrome.extension.lastError);
		//console.log(chrome.runtime.lastError);
	});

		chrome.cookies.set({"name":"PageSeed","url":"https://192.168.20.1","value":setEncryptSeed(password, param2)},function (cookie){
		//console.log(JSON.stringify(cookie));
		//console.log(chrome.extension.lastError);
		//console.log(chrome.runtime.lastError);
	});
}
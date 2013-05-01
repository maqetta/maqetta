/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*jslint browser:true */
/*global LoginWindowShiftKey:true */

define([
	'dojo/request/xhr',
	'orion/PageUtil'
], function(
	xhr,
	PageUtil
) {

	/*
	 *  Globals
	 */
	var userCreationEnabled;
	var registrationURI;

	var GENERIC_SERVER_MSG = 'A unexpected error prevented the operation from completing.  ' +
			'Please try again.  If the problem persists, please contact the server administrator.';
	var ADMIN_USERID = 'admin';

	function injectPlaceholderShims() {
		function textFocus(e) {
			var input = e.target;
			if (input.value === input.getAttribute('placeholder')) {
				input.value = '';
			}
		}
		function textBlur(e) {
			var input = e.target;
			if (input.value === '') {
				input.value = input.getAttribute('placeholder');
			}
		}
		function passwordFocus(e) {
			var input = e.target;
			if (input.value === input.getAttribute('placeholder')) {
				input.value = '';
				input.type = 'password';
			}
		}
		function passwordBlur(e) {
			var input = e.target;
			if (input.value === '') {
				input.value = input.getAttribute('placeholder');
				input.type = 'text';
			}
		}
		if (typeof document.createElement('input').placeholder === 'undefined') {
			var inputs = document.getElementsByTagName('input');
			for (var i=0 ; i < inputs.length; i++) {
				var input = inputs[i];
				var placeholderText = input.getAttribute('placeholder');
				switch (placeholderText && input.type) {
					case 'text':
						input.value = placeholderText;
						input.addEventListener('focus', textFocus);
						input.addEventListener('blur', textBlur);
						break;
					case 'password':
						input.value = placeholderText;
						input.addEventListener('focus', passwordFocus);
						input.addEventListener('blur', passwordBlur);
						input.type = 'text';
						break;
				}
			}
		}
	}

	function getParam(key) {
		var regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
		var results = regex.exec(window.location.href);
		if (results === null) {
			return;
		}
		return results[1];
	}

	function decodeBase64(input) {

		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 !== 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 !== 64) {
				output = output + String.fromCharCode(chr3);
			}

		}
		output = output.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < output.length; n++) {

			var c = output.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}

	function showErrorMessage(msg) {
		if (typeof msg !== "undefined") {
			document.getElementById("errorMessage").textContent = msg;
		}
		document.getElementById("errorWin").style.visibility = '';
	}

	function hideErrorMessage() {
		document.getElementById("errorMessage").textContent = "\u00a0";
		document.getElementById("errorWin").style.visibility = 'hidden';
	}

	function setResetMessage(isError, message) {
		//document.getElementById("reset_errorList").className = isError ? "loginError" : "loginInfo";
		showErrorMessage(message);
	}

	function confirmResetUser() {
		var responseObject;
		if (document.getElementById("reset").value === "" && document.getElementById("resetEmail").value === "") {
			setResetMessage(true, "Provide username or email to reset.");
			return;
		}

		var dataStr = "{login='" + document.getElementById("reset").value + "', email='" +
				document.getElementById("resetEmail").value + "'}";
		xhr.post('../useremailconfirmation', {
			data: dataStr,
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Orion-Version': '1'
			},
			handleAs: 'json'
		}).then(function(data) {	// success
			if (data.Message) {
				setResetMessage(false, data.Message);
			} else {
				showErrorMessage();
			}
		}, function(err) {			// error
			try {
				var responseObject = err.response.data;
				setResetMessage(true, responseObject.Message);
				return;
			} catch (e) {
				// not json
			}
			setResetMessage(true, err.response.xhr.statusText);
		});

		setResetMessage(false, "Sending password reset confirmation...");
	}

	function getRedirect() {
		var regex = new RegExp('[\\?&]redirect=([^&#]*)');
		var results = regex.exec(window.location.href);
		return results === null ? null : results[1];
	}

	function createOpenIdLink(openid) {
		if (openid !== "" && openid !== null) {
			var redirect = getRedirect();
			if (redirect !== null && PageUtil.validateURLScheme(decodeURIComponent(redirect))) {
				return "../login/openid?openid=" + encodeURIComponent(openid) + "&redirect=" + redirect;
			} else {
				return "../login/openid?openid=" + encodeURIComponent(openid);
			}
		}
	}

	function confirmLogin(email, password, event) {
		if (!email) {
			email = document.getElementById('login').value;
			password = document.getElementById('password').value;
		}
		if (email != ADMIN_USERID && !validateEmail(email)){
			return;
		}
		// shiftkey-click on Login causes Maqetta to open with no editors showing
		// Needed sometimes if Maqetta is hanging with a particular open file
		var resetWorkBench = LoginWindowShiftKey ? 'resetWorkbenchState=1' : '';

		xhr.post('../login/form', {
			query: {
				email: email,
				password: password
			},
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Orion-Version': '1'
			},
			handleAs: 'json'
		}).then(function(data) {	// success
			var redirect = getRedirect();
			if (redirect !== null) {
				if(resetWorkBench){
					if(redirect.indexOf('?')>=0){
						redirect += '&'+resetWorkBench;
					}else{
						redirect += '?'+resetWorkBench;
					}
				}
				setCookie("login", email);
				redirect = decodeURIComponent(redirect);
				if(PageUtil.validateURLScheme(redirect)) {
					window.location = redirect;
					return;
				}
			}
			window.close();
		}, function(err) {			// error
			showErrorMessage(err.response.data.error);
		});

		setResetMessage(false, "Logging in...");
	}

	function validateEmail(value) {
		var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*/;
		if(!regex.test(value)){
			showErrorMessage("Not valid email address");
			return false;
		}
		hideErrorMessage();
		return true;
	}

	function validatePassword() {
		if (document.getElementById("create_password").value !== document.getElementById("create_passwordRetype").value) {
			showErrorMessage("Passwords don't match!");
			return false;
		}
		hideErrorMessage();
		return true;
	}

	function confirmCreateUser() {
		var email = document.getElementById("create_login").value;
		if (!validateEmail(email)){
			return;
		}
		var name = document.getElementById("create_name").value;
		if (!validatePassword()) {
			document.getElementById("create_password").setAttribute("aria-invalid", "true");
			document.getElementById("create_passwordRetype").setAttribute("aria-invalid", "true");
			return;
		}
		document.getElementById("create_password").setAttribute("aria-invalid", "false");
		document.getElementById("create_passwordRetype").setAttribute("aria-invalid", "false");
		var password = document.getElementById("create_password").value;

		var xhrParams = {
			email: email,
			password: password
		};
		if (name) {
			xhrParams.Name = name;
		}
		xhr.post('../users', {
			query: xhrParams,
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Orion-Version': '1'
			},
			handleAs: 'json'
		}).then(function(response) {	// success
			if (response.HttpCode === 201) {
				var message = "User created. Confirmation email sent to "+email+".";
				showErrorMessage(message);
				hideRegistration();
				return;
			}
			confirmLogin(email, password);
		}, function(err) {			// error
			try {
				var response = err.response.data;
				showErrorMessage(response.Message);
				return;
			} catch (e) {
				// not json
			}
			showErrorMessage(GENERIC_SERVER_MSG);
		});

		setResetMessage(false, "Registering account...");
	}

	function revealRegistration() {
		// If registrationURI is set and userCreation is not, open the URI in a new window
		if (!userCreationEnabled && registrationURI) {
			window.open(registrationURI);
			return;
		}
		document.getElementById('orionLogin').style.visibility = 'hidden';
		document.getElementById('orionRegister').style.visibility = 'hidden';
		document.getElementById('newUserHeaderShown').style.visibility = '';
		document.getElementById('landingArea').classList.add('register');
	}

	function hideRegistration() {
		document.getElementById('orionLogin').style.visibility = '';
		document.getElementById('orionRegister').style.visibility = '';
		document.getElementById('newUserHeaderShown').style.visibility = 'hidden';
		document.getElementById('landingArea').classList.remove('register');
	}

	function formatForNoUserCreation() {
		document.getElementById('orionRegister').style.visibility = 'hidden';
	}

	function revealResetUser() {
		document.getElementById('orionLogin').style.visibility = 'hidden';
		if (!userCreationEnabled && !registrationURI) {
			document.getElementById('orionRegister').style.visibility = 'hidden';
			document.getElementById('orionReset').style.height = '212px';
		}
		document.getElementById('newUserHeaderShown').style.display = 'none';
		document.getElementById('orionReset').style.visibility = '';
		document.getElementById('reset').focus();
	}

	function hideResetUser() {
		document.getElementById('orionLogin').style.visibility = '';
		document.getElementById('newUserHeaderShown').style.display = '';
		document.getElementById('orionReset').style.visibility = 'hidden';
	}

	function openServerInformation() {
		window.open("/mixloginstatic/ServerStatus.html");
	}
	
	function setCookie(cookieName, cookieValue, numberDays){
		if(!numberDays){
			numberDays = 365;
		}
		var today = new Date();
		var expireDate = new Date();
		expireDate.setTime(today.getTime() + 3600000 * 24 * numberDays);
		document.cookie = cookieName + "=" + window.escape(cookieValue) + ";expires=" +
				expireDate.toGMTString();
	}
	
	function getCookie(cookieName){
		var cookies=document.cookie.split(";");
		for(var i=0; i<cookies.length; i++){
			var c = cookies[i];
			var eq = c.indexOf('=');
			var name = c.substr(0, eq);
			if(name == cookieName){
				return window.unescape(c.substr(eq+1));
			}
		}
		return null;
	}

	require(['dojo/domReady!'], function() {
		var ua = window.navigator.userAgent;
		var ieIndex = ua.indexOf('MSIE');
		var isIE = (ieIndex>=0) ? parseInt(ua.substr(ieIndex+4), 10) : false;
		if(isIE){
			var browser_not_supported = document.getElementById("browser_not_supported");
			browser_not_supported.style.display = "";
			browser_not_supported.style.color = "red";
			browser_not_supported.style.fontSize = "16px";
			browser_not_supported.style.padding = "20px 15px";
			return;
		}
		
		// global variable
		LoginWindowShiftKey = false;
		function DocumentKeyHandler(event){
			LoginWindowShiftKey = event.shiftKey;
		}
		document.onkeydown = document.onkeyup = DocumentKeyHandler;

		var error = getParam("error");
		if (error) {
			var errorMessage = decodeBase64(error);

			showErrorMessage(errorMessage);
		}

		xhr.post('../login/canaddusers', {
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Orion-Version': '1'
			},
			handleAs: 'json'
		}).then(function(data) {	// success
			userCreationEnabled = data.CanAddUsers;
			registrationURI = data.RegistrationURI;
			if (!userCreationEnabled && !registrationURI) {
				formatForNoUserCreation();
			}
			document.getElementById("login-window").style.display = '';
			document.getElementById("login").focus();
		});

		xhr.post('../useremailconfirmation/cansendemails', {
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Orion-Version': '1'
			},
			handleAs: 'json'
		}).then(function(data) {	// success
			if (data.emailConfigured === false) {
				document.getElementById("resetUserLink").style.display = 'none';
			}
		});

		xhr.get('/server-status.json', { //$NON-NLS-0$
			timeout: 15000,
			handleAs: 'json'
		}).then(function(results) {
			var messages = results.messages;
			if (messages.length > 0) {
				var currentDate = new Date();
				var startDate = new Date(messages[0].startdate);
				startDate.setHours(0, 0, 0, 0);
				if (startDate > currentDate) return;
				var endDate = new Date(messages[0].enddate);
				endDate.setHours(23, 59, 59);
				if (endDate <= currentDate)  return;
				document.getElementById("orionInfoArea").style.visibility = '';
				document.getElementById("orionInfoMessage").textContent = messages[0].title;
			}
		});

		injectPlaceholderShims();

		var loginCookie = getCookie('login');
		if(loginCookie){
			document.getElementById("login").value = loginCookie;
		}
		
		document.getElementById("login").onkeyup = function(event) {
			if (event.keyCode === 13) {
				confirmLogin();
			} else {
				validateEmail(document.getElementById("login").value);
			}
		};

		document.getElementById("password").onkeypress = function(event) {
			if (event.keyCode === 13) {
				confirmLogin();
			} else {
				return true;
			}
		};

		document.getElementById("loginForm").onsubmit = function(e) {
			confirmLogin(null, null, e);
			return false;
		};

		document.getElementById("orionInfoArea").onclick = openServerInformation;

		document.getElementById("resetUserLink").onclick = revealResetUser;

		document.getElementById("reset").onkeypress = function(event) {
			if (event.keyCode === 13) {
				confirmResetUser();
			}
			return true;
		};
		
		document.getElementById("resetEmail").onkeyup = function(event) {
			if (event.keyCode === 13) {
				confirmResetUser();
			} else {
				validateEmail(document.getElementById("resetEmail").value);
			}
			return true;
		};

		document.getElementById("registerButton").onclick = revealRegistration;

		document.getElementById("create_login").onkeyup = function(event) {
			if (event.keyCode === 13) {
				confirmCreateUser();
			} else {
				validateEmail(document.getElementById("create_login").value);
			}
		};

		document.getElementById("create_password").onkeyup = function(event) {
			if (event.keyCode === 13) {
				confirmCreateUser();
			} else {
				validatePassword();
			}
		};

		document.getElementById("create_passwordRetype").onkeyup = function(event) {
			if (event.keyCode === 13) {
				confirmCreateUser();
			} else {
				validatePassword();
			}
		};

		document.getElementById("createButton").onclick = confirmCreateUser;

		document.getElementById("hideRegisterButton").onclick = hideRegistration;

		
		document.getElementById("cancleResetButton").onclick = hideResetUser;

		document.getElementById("sendResetButton").onclick = confirmResetUser;
	});
});
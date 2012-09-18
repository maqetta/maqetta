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

/*jslint browser:true devel:true*/
/*global define window*/

define(['domReady'], function(domReady) {
	var userCreationEnabled;
	var registrationURI;

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

	function setResetMessage(isError, message) {
		document.getElementById("errorMessage").innerHTML = message;
		//document.getElementById("reset_errorList").className = isError ? "loginError" : "loginInfo";
		document.getElementById("errorWin").style.visibility = '';
	}

	function confirmResetUser() {
		var responseObject;
		if (document.getElementById("reset").value === "" && document.getElementById("resetEmail").value === "") {
			setResetMessage(true, "Provide username or email to reset.");
			return;
		}
		var mypostrequest = new XMLHttpRequest();
		mypostrequest.onreadystatechange = function() {
			document.getElementById("errorWin").style.visibility = 'hidden';
			if (mypostrequest.readyState === 4) {
				if (mypostrequest.status === 200) {
					responseObject = JSON.parse(mypostrequest.responseText);
					if (responseObject.Message) {
						setResetMessage(false, responseObject.Message);
					} else {
						document.getElementById("errorWin").style.visibility = '';
					}
				} else {
					try {
						responseObject = JSON.parse(mypostrequest.responseText);
						if (responseObject.Message) {
							setResetMessage(true, responseObject.Message);
							return;
						}
					} catch (e) {
						// not json
					}
					setResetMessage(true, mypostrequest.statusText);
				}
			}
		};

		mypostrequest.open("POST", "../useremailconfirmation", true);
		mypostrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		mypostrequest.setRequestHeader("Orion-Version", "1");
		mypostrequest.send("{login='" + document.getElementById("reset").value + "', email='" + document.getElementById("resetEmail").value + "'}");

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
			if (redirect !== null) {
				return "../login/openid?openid=" + encodeURIComponent(openid) + "&redirect=" + getRedirect();
			} else {
				return "../login/openid?openid=" + encodeURIComponent(openid);
			}
		}
	}

	function confirmLogin(login, password, event) {
		if (!login) {
			login = document.getElementById('login').value;
			password = document.getElementById('password').value;
		}
		if (!validateEmail(login)){
			return;
		}
		// shiftkey-click on Login causes Maqetta to open with no editors showing
		// Needed sometimes if Maqetta is hanging with a particular open file
		var resetWorkBench = (event && event.shiftKey) ? 'resetWorkbenchState=1' : '';
		var mypostrequest = new XMLHttpRequest();
		mypostrequest.onreadystatechange = function() {
			if (mypostrequest.readyState === 4) {
				if (mypostrequest.status !== 200 && window.location.href.indexOf("http") !== -1) {
					var responseObject = JSON.parse(mypostrequest.responseText);
					document.getElementById("errorMessage").innerHTML = responseObject.error;
					document.getElementById("errorWin").style.visibility = '';
				} else {
					var redirect = getRedirect();
					if (redirect !== null) {
						if(resetWorkBench){
							if(redirect.indexOf('?')>=0){
								redirect += '&'+resetWorkBench;
							}else{
								redirect += '?'+resetWorkBench;
							}
						}
						setCookie("login", login);
						window.location = decodeURIComponent(redirect);
					} else {
						window.close();
					}

				}
			}
		};

		var parameters = "login=" + encodeURIComponent(login) + "&password=" + encodeURIComponent(password);
		mypostrequest.open("POST", "../login/form", true);
		mypostrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		mypostrequest.setRequestHeader("Orion-Version", "1");
		mypostrequest.send(parameters);
	}

	function validateEmail(value) {
		var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*/;
		if(!regex.test(value)){
			document.getElementById("errorWin").style.visibility = '';
			document.getElementById("errorMessage").innerHTML = "Not valid email address";
			return false;
		}
		document.getElementById("errorWin").style.visibility = 'hidden';
		document.getElementById("errorMessage").innerHTML = "&nbsp;";
		return true;
	}

	function validatePassword() {
		if (document.getElementById("create_password").value !== document.getElementById("create_passwordRetype").value) {
			document.getElementById("errorWin").style.visibility = '';
			document.getElementById("errorMessage").innerHTML = "Passwords don't match!";
			return false;
		}
		document.getElementById("errorWin").style.visibility = 'hidden';
		document.getElementById("errorMessage").innerHTML = "&nbsp;";
		return true;
	}

	function confirmCreateUser() {
		var login = document.getElementById("create_login").value;
		if (!validateEmail(login)){
			return;
		}
		if (!validatePassword()) {
			document.getElementById("create_password").setAttribute("aria-invalid", "true");
			document.getElementById("create_passwordRetype").setAttribute("aria-invalid", "true");
			return;
		}
		document.getElementById("create_password").setAttribute("aria-invalid", "false");
		document.getElementById("create_passwordRetype").setAttribute("aria-invalid", "false");
		var mypostrequest = new XMLHttpRequest();
		var password = document.getElementById("create_password").value;
		mypostrequest.onreadystatechange = function() {
			if (mypostrequest.readyState === 4) {
				if (mypostrequest.status !== 200 && window.location.href.indexOf("http") !== -1) {
					if (!mypostrequest.responseText) {
						return;
					}
					var responseObject = JSON.parse(mypostrequest.responseText);
					document.getElementById("errorMessage").innerHTML = responseObject.Message;
					document.getElementById("errorWin").style.visibility = '';
				} else {
					confirmLogin(login, password);
				}
			}
		};
		var parameters = "login=" + encodeURIComponent(login) + "&password=" + encodeURIComponent(password);
		mypostrequest.open("POST", "../users", true);
		mypostrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		mypostrequest.setRequestHeader("Orion-Version", "1");
		mypostrequest.send(parameters);
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
	}

	function hideRegistration() {
		document.getElementById('orionLogin').style.visibility = '';
		document.getElementById('orionRegister').style.visibility = '';
		document.getElementById('newUserHeaderShown').style.visibility = 'hidden';
	}

	function formatForNoUserCreation() {
		document.getElementById('orionRegister').style.visibility = 'hidden';
		document.getElementById('orionOpen').style.top = '188px';
		document.getElementById('orionOpen').style.height = '85px';
		document.getElementById('orionOpen').style.paddingTop = '45px';
	}

	function revealResetUser() {
		document.getElementById('orionLogin').style.visibility = 'hidden';
		if (!userCreationEnabled && !registrationURI) {
			document.getElementById('orionRegister').style.visibility = 'hidden';
			document.getElementById('orionReset').style.height = '212px';
			document.getElementById('orionOpen').style.top = '251px';
			document.getElementById('orionOpen').style.height = '50px';
			document.getElementById('orionOpen').style.paddingTop = '17px';
		}
		document.getElementById('newUserHeaderShown').style.display = 'none';
		document.getElementById('orionReset').style.visibility = '';
	}

	function hideResetUser() {
		document.getElementById('orionLogin').style.visibility = '';
		if (userCreationEnabled || registrationURI) {
			document.getElementById('orionRegister').style.visibility = '';
		} else {
			document.getElementById('orionOpen').style.top = '188px';
			document.getElementById('orionOpen').style.height = '85px';
			document.getElementById('orionOpen').style.paddingTop = '45px';
		}
		document.getElementById('newUserHeaderShown').style.display = '';
		document.getElementById('orionReset').style.visibility = 'hidden';
	}
	
	function setCookie(cookieName, cookieValue, numberDays){
		if(!numberDays){
			numberDays = 365;
		}
		var today = new Date();
		var expireDate = new Date();
		expireDate.setTime(today.getTime() + 3600000 * 24 * numberDays);
		document.cookie = cookieName + "=" + escape(cookieValue) + ";expires=" + expireDate.toGMTString();
	}
	
	function getCookie(cookieName){
		var cookies=document.cookie.split(";");
		for(var i=0; i<cookies.length; i++){
			var c = cookies[i];
			var eq = c.indexOf('=');
			var name = c.substr(0, eq);
			if(name == cookieName){
				return unescape(c.substr(eq+1));
			}
		}
		return null;
	}

	domReady(function() {

		var error = getParam("error");
		if (error) {
			var errorMessage = decodeBase64(error);

			document.getElementById("errorWin").style.visibility = '';
			document.getElementById("errorMessage").innerHTML = errorMessage;
		}

		var checkusersrequest = new XMLHttpRequest();
		checkusersrequest.onreadystatechange = function() {
			if (checkusersrequest.readyState === 4) {
				if (checkusersrequest.status === 200) {
					var responseObject = JSON.parse(checkusersrequest.responseText);
					userCreationEnabled = responseObject.CanAddUsers;
					registrationURI = responseObject.RegistrationURI;
					if (!userCreationEnabled && !registrationURI) {
						formatForNoUserCreation();
					}
					document.getElementById("login-window").style.display = '';
					document.getElementById("login").focus();
				}
			}
		};

		checkusersrequest.open("POST", "../login/canaddusers", true);
		checkusersrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		checkusersrequest.setRequestHeader("Orion-Version", "1");
		checkusersrequest.send();

		var checkemailrequest = new XMLHttpRequest();
		checkemailrequest.onreadystatechange = function() {
			if (checkemailrequest.readyState === 4) {
				if (checkemailrequest.status === 200) {
					var responseObject = JSON.parse(checkemailrequest.responseText);
					if (responseObject.emailConfigured === false) {
						document.getElementById("resetUserLink").style.display = 'none';
					}

				}
			}
		};

		checkemailrequest.open("POST", "../useremailconfirmation/cansendemails", true);
		checkemailrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		checkemailrequest.setRequestHeader("Orion-Version", "1");
		checkemailrequest.send();


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
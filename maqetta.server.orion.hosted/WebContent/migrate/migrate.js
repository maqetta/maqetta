/* user clicks migrate workspace button */
function migrateWorkspace(){
	var migrateRequest = new XMLHttpRequest();
	migrateRequest.onreadystatechange = function() {
		if (migrateRequest.readyState === 4) {
			if (migrateRequest.response=="OK") {
				location.href="/maqetta/";
				
			}else{
				document.getElementById("migrateWorkspace").innerHTML = "Error migrating workspace";
			}
		}
	};
	var parameters = "migrate=true";
	migrateRequest.open("POST", "/maqetta/cmd/migrate", true);
	migrateRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	migrateRequest.setRequestHeader("Orion-Version", "1");
	migrateRequest.send(parameters);
}
/* user clicked skip button */
function skip(){
	location.href="../";	
}

function getParam(key) {
	var regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
	var results = regex.exec(window.location.href);
	if (results === null) {
		return;
	}
	return results[1];
}

function verifyExistingUser(){
	
	var checkusersrequest = new XMLHttpRequest();
			checkusersrequest.onreadystatechange = function() {
				if (checkusersrequest.readyState === 4) {
				if (checkusersrequest.response=="WORKSPACE_EXISTS") {
						document.getElementById("migrateWorkspace").style.display = '';
						//document.getElementById("login").focus();
					
				}else{
					document.getElementById("message").innerHTML="Error";
					location.href="/maqetta/";
				}
			}
		};
	
	//var parameters = "login=" + encodeURIComponent(login) + "&password=" + encodeURIComponent(password) + "&loginTolken=" + loginTolken;
	checkusersrequest.open("POST", "/maqetta/cmd/migrate", true);
	checkusersrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	checkusersrequest.setRequestHeader("Orion-Version", "1");
	checkusersrequest.send();
}

verifyExistingUser();
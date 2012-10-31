
var ajax;      //this will contain the XMLHttpRequest object
var curLink;   //the currently selected top-menu link 

function getXMLHttpRequestObject() {
	ajax = false;
	if (window.XMLHttpRequest) {
		ajax = new XMLHttpRequest();  // IE 7, Mozilla, Safari, Firefox, Opera, most browsers:
	} else if (window.ActiveXObject) { // Older IE browsers
		try {
			ajax = new ActiveXObject("Msxml2.XMLHTTP");  // Create type Msxml2.XMLHTTP, if possible:
		} catch (e) { 
			try {
				ajax = new ActiveXObject("Microsoft.XMLHTTP");  // Create the older type instead:
			} catch (e) { }
		}
	} 
	return ajax;
}

function init() {
  ajax = getXMLHttpRequestObject(); 
  if (ajax) {  
    if (document.getElementById('results')) {    
		document.getElementById('userguide_link').onclick = displayUserguide;
		document.getElementById('tutorials_link').onclick = displayTutorials;
		document.getElementById('techguide_link').onclick = displayTechguide;
		document.getElementById('releasenotes_link').onclick = displayReleasenotes;
		document.getElementById('resource_link').onclick = displayResources;
		curLink = document.getElementById('userguide_link'); 
		curLink.style.fontWeight = 'bold';
		displayUserguide(); 
	}
  }
}
function displayUserguide() 	{displaySection('userguide.html','userguide_link');}
function displayTutorials() 	{displaySection('tutorials.html','tutorials_link');}
function displayTechguide() 	{displaySection('techguide.html','techguide_link');}
function displayResources()		{displaySection('resources.html','resource_link');}
function displayReleasenotes()	{displaySection('releasenotes.html','releasenotes_link');}

function displaySection(url, id) {
	startRequest(url);
	curLink.style.fontWeight = 'normal';
	curLink = document.getElementById(id);
	curLink.style.fontWeight = 'bold';
}

function startRequest(url) {
	if (ajax) {
        ajax.onreadystatechange = handleResponse;
        ajax.open('get', url, true);
        ajax.send(null);
	}
}

function handleResponse() {
  if (ajax.readyState == 4) {
      var results = document.getElementById('results');
      results.style.display = 'block';
      while (results.hasChildNodes()) {
        results.removeChild(results.lastChild);  //clear previous results
      }
	  results.innerHTML = ajax.responseText;    //display the new results (html fragment)
  	  externalLinks();  				 		//set external links to open a new tab or window
  }
}

function externalLinks() {  
 if (!document.getElementsByTagName) return;  
 var anchors = document.getElementsByTagName("a");  
 for (var i=0; i<anchors.length; i++) {  
   var anchor = anchors[i];  
   if (anchor.getAttribute("href") &&  
       anchor.getAttribute("rel") == "external")  
     anchor.target = "_blank";  
 }  
}  

window.onload = init;

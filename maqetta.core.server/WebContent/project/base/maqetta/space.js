define(function() {
	/**
	 * Collapses all text nodes that only contain white space characters into empty string.
	 * Skips certain nodes where whitespace does not impact layout and would cause unnecessary processing.
	 * Similar to features that hopefully will appear in CSS3 via white-space-collapse
	 * 
	 * @param {HTMLElement} element Element whose text nodes should be collapse
	 */
	var skip = {"SCRIPT":1, "STYLE":1},
		collapse = function(element) {
		for (var i = 0; i < element.childNodes.length; i++){
			var cn = element.childNodes[i];
			if (cn.nodeType == 3){    // Text node
				//FIXME: exclusion for SCRIPT, CSS content?
				cn.nodeValue = cn.data.replace(/^[\f\n\r\t\v\ ]+$/g,"");
			}else if (cn.nodeType == 1 && !skip[cn.nodeName]){ // Element node
				collapse(cn);
			}
		}
	};

	var handler = function() {
		if (document.body.getAttribute('data-davinci-ws') == 'collapse') {
			collapse(document.body);
		}
	};

	//FIXME: do we want this to run when we load from the Workbench?
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", handler, false);
		window.addEventListener("load", handler, false);
	} else if (window.attachEvent) {
		window.attachEvent("onload", handler);
	}
});

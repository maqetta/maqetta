define(["dijit/popup", "dijit/registry", "dojo/dom", "dijit/Tooltip"], 
function(popup, registry, dom, Tooltip) {
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
	
	// The following code defines davinci.popup which provides
	// runtime support for showing and hiding overlay widgets
	// such as Dialog, TooltipDialog, Tooltip and Menu.
	
/* SAMPLE HTML THAT WORKS WITH CODE BELOW:

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Untitled</title>
<script type="text/javascript" src="lib/dojo/dojo/dojo.js" data-dojo-config="'parseOnLoad':true,'async':true,'packages':[{'name':'gridx','location':'../gridx'},{'name':'clipart','location':'../../clipart'},{'name':'maqettaSamples','location':'../../../samples'},{'name':'maqetta','location':'../../maqetta'},{'name':'shapes','location':'../../shapes'},{'name':'widgets','location':'../../custom'}],'themeMap':[['Android','',['themes/android/android.css']],['BlackBerry','',['themes/blackberry/blackberry.css']],['iPad','',['themes/ipad/ipad.css']],['iPhone','',['themes/iphone/iphone.css']],['.*','',['themes/iphone/iphone.css']]],'mblThemeFiles':[],'mblLoadCompatPattern':'', 'mblLoadCompatPattern': ''"></script>
<script type="text/javascript">
require([
  "dijit/dijit",
  "dojo/parser",
  "maqetta/space",
  "maqetta/AppStates",
  "dijit/form/Button",
  "dijit/Calendar",
  "dijit/Dialog",
  "dijit/TooltipDialog",
  "dijit/Tooltip",
  "dijit/Menu",
  "dijit/MenuItem"
]);
</script>
<style>@import "themes/claro/document.css";@import "themes/claro/claro.css";@import "app.css";
</style>
<script type="text/javascript" src="app.js"></script>
</head>
<body class="claro" data-maq-flow-layout="true" data-maq-comptype="desktop" data-maq-ws="collapse" id="myapp" data-maq-appstates="{}">
 <input type="button" data-dojo-type="dijit.form.Button" intermediateChanges="false" label="show" iconClass="dijitNoIcon" onclick="davinci.popup.show('menu55')"></input>
 <input data-dojo-type="dijit.Calendar" id="cal1" style="position: absolute; z-index: 900; left: 174px; top: 44px; display: none;"></input>
 <input type="button" data-dojo-type="dijit.form.Button" intermediateChanges="false" label="hide" iconClass="dijitNoIcon" onclick="davinci.popup.hide('menu55')"></input>
 <div data-dojo-type="dijit/Dialog" id="myDialog" title="Name and Address">
     <table class="dijitDialogPaneContentArea">
         <tr>
             <td><label for="name">Name:</label></td>
             <td><input name="name" id="name"></input>
         </td>
         <tr>
             <td><label for="address">Address:</label></td>
             <td><input name="address" id="address"></input>
         </td>
     </tr>

     <div class="dijitDialogPaneActionBar">
         <button type="submit" id="ok">OK</button>
         <button type="button" onClick="myDialog.onCancel();" id="cancel">Cancel</button>
     </div>
 </tr>
</table>
</div>
<div data-dojo-type="dijit/TooltipDialog" id="ttd1" style="display:none;">
        <div><label for="name2">Name:</label> <input id="name2" name="name2"/></div>
        <div><label for="hobby2">Hobby:</label> <input id="hobby2" name="hobby2"/></div>
        <div><button type="submit">Save</button></div>
</div>
<div data-dojo-type="dijit/Tooltip" id="tt1">
    a <i>disposition</i> to bear injuries patiently : <b>forbearance</b>
</div>
<div data-dojo-type="dijit/Menu" id="menu55" style="display: none;">
    <div data-dojo-type="dijit/MenuItem" data-dojo-props="iconClass:'dijitEditorIcon dijitEditorIconCut',
        onClick:function(){alert('not actually cutting anything, just a test!')}">Cut</div>
    <div data-dojo-type="dijit/MenuItem" data-dojo-props="iconClass:'dijitEditorIcon dijitEditorIconCopy',
        onClick:function(){alert('not actually copying anything, just a test!')}">Copy</div>
    <div data-dojo-type="dijit/MenuItem" data-dojo-props="iconClass:'dijitEditorIcon dijitEditorIconPaste',
        onClick:function(){alert('not actually pasting anything, just a test!')}">Paste</div>
</div>
</body></html>

 */
	var maqettaPopup = function(){};
	maqettaPopup.prototype = {
		// Displays the given widget (specified by ID) as a popup
		show: function(widgetId){
			var dijitWidget = registry.byId(widgetId);
			if(dijitWidget){
				if(dijitWidget.declaredClass == 'dijit.Tooltip'){
					if(!davinci.tooltipWrapper){
						var div = davinci.tooltipWrapper = document.createElement('div');
						div.style.position = 'absolute';
						div.style.left = '100px';
						div.style.top = '100px';
						document.body.appendChild(div);
					}
					var node = dom.byId(dijitWidget.domNode);
					Tooltip.show(node.innerHTML, davinci.tooltipWrapper);
				}else{
					popup.open({
						popup:dijitWidget
					});
				}
			}
		},
		// Closes the popup for the given widget
		hide: function(widgetId){
			var dijitWidget = registry.byId(widgetId);
			if(dijitWidget){
				if(dijitWidget.declaredClass == 'dijit.Tooltip'){
					if(davinci.tooltipWrapper){
						Tooltip.hide(davinci.tooltipWrapper);
					}
				}else{
					popup.close(dijitWidget);
				}
			}
		}
	};

	
	//FIXME: remove all references to davinci global and davinci.states
	if (typeof davinci === "undefined") { davinci = {}; }
	davinci.popup = new maqettaPopup();

});

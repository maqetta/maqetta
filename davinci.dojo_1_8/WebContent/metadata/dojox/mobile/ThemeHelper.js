define([
    "dojo/_base/array",
    "dojo/dom-style",
    "davinci/model/Path",
    "davinci/html/HTMLElement",
    "davinci/html/HTMLText",
    "davinci/Theme",
    "dojo/_base/sniff"
], function(
    array,
    domStyle,
    Path,
    HTMLElement,
    HTMLText,
    Theme,
    has
) {

return {

	
	onContentChange: function(context, theme){

		if(!context || !context.editor || !context.editor.isActiveEditor()){
			return;
		}
		var userDoc, useBodyFontBackgroundClass;
		if(context && context.rootNode){
			userDoc = context.rootNode.ownerDocument;
		}
		if(theme){
			useBodyFontBackgroundClass = theme.useBodyFontBackgroundClass;
		}
		if(userDoc && useBodyFontBackgroundClass){
			var nodes = userDoc.querySelectorAll('.'+useBodyFontBackgroundClass);
			var body = userDoc.body;
			if(nodes.length>0){
				var props = ['backgroundAttachment', 'backgroundClip', 'backgroundColor', 'backgroundImage', 
				             'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize',
				             'color','fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant'];
				// Using setTimeout because BODY style may not be fully baked
				// due to browser quirks with delayed computation of computed style.
				setTimeout(function(){
					var body_style = domStyle.get(body);
					for(var i=0; i<nodes.length; i++){
						var style = nodes[i].style;
						props.forEach(function(prop){
							style[prop] = body_style[prop];
						});
					}
				},50);
			}	
		}
		debugger;
		var cb = context.getDijit().byId('mobile_attributes');
		var dj = context.getDojo();
		//dj.require("dojo.aspect");
		var c = dj.connect(cb, "openDropDown", function(){
			  debugger;
			  if (!cb._mqRunOnce) {
				 cb._mqRunOnce = true;
			  	cb.dropDown.onPage(1);
			  }
			}.bind(cb));
		//cb.set('pageSize', 3);
		cb._onFocus();
		//window.setTimeout(function(){cb.dropDown.onPage(1);},1000)
		
	},
	
	getDomNode: function(context, widget, subwidget){
		
		debugger;
		var dj = context.getDojo();
		var nodes = dj.query(".mblComboBoxMenuItem", context.rootNode);
		return nodes[0];
		
	},
	
	selectSubwidget: function(context, widget, subwidget){
		var domNode,
			frame;
		
		debugger;
		if (widget.type == "dojox.mobile.ComboBox" ) {
			var dj = context.getDojo();
			if (subwidget == "ComboBoxMenuPrevious/Next") {
				var nodes = dj.query(".mblComboBoxMenuNextButton", context.rootNode);
				domNode = nodes[0];
			} else if (subwidget == "CombBoxMenuItem") {
				var nodes = dj.query(".mblComboBoxMenuItem", context.rootNode);
				domNode = nodes[1];
			}
			
		}
		if (domNode) {
			//var box = this.getRelativeBox(domNode);
			var frame = context.getDocument().createElement("div");
			frame.className = "editSubwidgetFocusFrame";
			frame.id = "editSubwidgetFocusFrame";
			frame.style.position = "absolute";
			var padding = 2; // put some space between the subwidget and box
			frame.style.width = domNode.offsetWidth + (padding * 2) + "px";
			frame.style.height = domNode.offsetHeight + (padding * 2) + "px";
			frame.style.top =  (domNode.offsetTop - padding) + "px";
			frame.style.left = (domNode.offsetLeft - padding) + "px"; 
			frame.style.padding = padding + 'px';
			frame.style.display = "block";
			domNode.parentNode.parentNode.parentNode.appendChild(frame);
		}
		return frame;

	},
  
};

});
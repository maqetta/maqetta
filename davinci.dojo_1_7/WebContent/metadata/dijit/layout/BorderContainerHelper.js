define(["dojo/_base/array", "dojo/_base/connect"], function (array, connect) {
return function(){
	this.create = function(/*Widget*/ widget, /*Object*/srcElement){
		// wire panel size changes to the shadow dom so splitters become effective
		connect.connect(widget.dijitWidget, "_layoutChildren", srcElement, function(/*String?*/changedRegion, /*Number?*/ changedRegionSize){
			if(changedRegionSize === undefined){ return; }
			var region,
				changedSide = /left|right|leading|trailing/.test(changedRegion);
			if (!changedSide){ // might be an id
				array.some(this.children, function (child) {
					if (child.getAttribute("id") === changedRegion){
						changedRegion = child.getAttribute("region");
						changedSide = /left|right|leading|trailing/.test(changedRegion);
						return true; // we are done
					}
				});
			}
			if(array.some(this.children, function(child){
				region = child; return child.getAttribute && child.getAttribute("region") == changedRegion;
			})){
				var style = region.getAttribute(style),
					prop = (changedSide ? "width" : "height"),
					value = changedRegionSize+"px",
					written;
				// Rewrite style rule to change only width or height portion
				style = array.map((style||"").split(";"), function(rule){
					var key = rule.split(":");
					if(key[0] == prop){
						written = true;
						rule = prop + ":" + value;
					}
					return rule;
				}).join(";");
				if(!written){
					style += prop+":"+value+";"
				}
				region.setAttribute("style", style);
			}
			var selection = widget._edit_context.getSelection();
			if(selection && selection.length) {
				widget._edit_context.select(selection[0]); // FIXME: should use updateFocus?
			}
		});
	};
	
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 */
	this.initialSize = function(args){
		var pw = args.parent;
		// If widget is not being added at an absolute location (i.e., no value for args.position)
		// and if parent is BODY or a ContentPane, then set initial size to 100%
		if(args && !args.position && pw.type && (pw.type == 'html.body' || pw.type == 'dijit.layout.ContentPane')){
			return {width:'100%',height:'100%'};
		}
	};

};
});
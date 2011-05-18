dojo.provide("davinci.libraries.dojo.dijit.layout.BorderContainerHelper");

dojo.declare("davinci.libraries.dojo.dijit.layout.BorderContainerHelper", null, {

	create: function(/*Widget*/ widget, /*Object*/srcElement){
		// wire panel size changes to the shadow dom so splitters become effective
		dojo.connect(widget.dijitWidget, "_layoutChildren", srcElement, function(/*String?*/changedRegion, /*Number?*/ changedRegionSize){
			if(changedRegionSize === undefined){ return; }
			var region,
				changedSide = /left|right|leading|trailing/.test(changedRegion);
			if(dojo.some(this.children, function(child){
				region = child; return child.getAttribute && child.getAttribute("region") == changedRegion;
			})){
				var style = region.getAttribute(style),
					prop = (changedSide ? "width" : "height"),
					value = changedRegionSize+"px",
					written;
				// Rewrite style rule to change only width or height portion
				style = dojo.map((style||"").split(";"), function(rule){
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
		});
	}

});
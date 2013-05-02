define([
	"dojo/i18n!../nls/dijit"
], function(dijitNls) {

var ContentPaneHelper = function() {};
ContentPaneHelper.prototype = {
		//TODO: this doesnt seem necessary, and seems to cause problems		
//		destroy: function(/*Widget*/ widget){
//			// summary:
//			//		Overriden to remove child widgets the user created in the Dojo Composition Tool.
//			//
//			if(!widget){
//				return;
//			}
//			widget=widget.dijitWidget;
//			
//			// destroy children either embedded or loaded anyway
//			var containerNode = (widget.containerNode || widget.domNode);
//			dojo.forEach(dojo.query("[widgetId]", containerNode).map(davinci.ve.widget.byNode), function(w){
//				w.destroy();
//			});
//			widget.destroy();
//		},
		create: function(widget, srcElement){
			//
			// RadioGroupSlide in particular needs the contentPanes to have a background for the sliding to look right
			//
			var parent = widget.getParent();
			if (parent && (parent.type == "dojox/layout/RadioGroup" || parent.type == "dojox/layout/RadioGroupSlide" || parent.type == "dojox/layout/RadioGroupFade")){
				if (!widget.getStyle().match("background")){
					widget.setStyleValues({background: "white"});
				}
			}
		},

		getContainerNode: function(/*Widget*/ widget){
			// summary:
			//		Overriden to only return the container node if this is not a href ContentPane
			//
			if(!widget){
				return undefined;
			}
			widget = widget.dijitWidget;

			// FIXME: should use davinci.ve.widget.getProperty(widget, "href") to get the href?
			if(widget.href){
				return undefined;
			}
			return widget.containerNode || widget.domNode;
		},

		getWidgetDescriptor: function(widget) {
			var text = "";

			var region = widget.attr("region");
			if (region) {
				if (text.length > 0) {
					text += " ";
				}

				text+= dojo.replace(dijitNls.paneRegion, [region])
			}

			return text;
		},

		preProcessData: function(data) {
			// we need parseOnLoad set to false so that the content pane doesn't try to parse its contents
			data.properties.parseOnLoad = false;
			return data;
		},

		cleanSrcElement: function(srcElement) {
			// but we don't want parseOnLoad to be in the source as that will break
			// contentpane from working outside of maqetta
			srcElement.removeAttribute("parseOnLoad");
		},
		
		resizeAllowWhich: function(widget, allowWhich){
			allowWhich.resizeLeft = allowWhich.resizeRight = allowWhich.resizeTop = allowWhich.resizeBottom = false;
			if(!widget){
				return;
			}
			var parent = widget.getParent();
			if(!parent){
				return;
			}
			// If ContentPane isn't a child of a dijit layout container, then allow resize on all sides and corners
			if(!parent.dijitWidget || !parent.dijitWidget.layout){
				allowWhich.resizeLeft = allowWhich.resizeRight = allowWhich.resizeTop = allowWhich.resizeBottom = true;
			}else{
				var dijitWidget = widget.dijitWidget;
				if(dijitWidget){
					if(dijitWidget.region == 'left'){
						allowWhich.resizeRight = true;
					}else if(dijitWidget.region == 'right'){
						allowWhich.resizeLeft = true;
					}else if(dijitWidget.region == 'top'){
						allowWhich.resizeBottom = true;
					}else if(dijitWidget.region == 'bottom'){
						allowWhich.resizeTop = true;
					}
				}
			}
		}
	};

return ContentPaneHelper;

});
dojo.provide("davinci.libraries.dojo.dijit.layout.ContentPaneHelper");

dojo.declare("davinci.libraries.dojo.dijit.layout.ContentPaneHelper", null, {

		//TODO: this doesnt seem necessary, and seems to cause problems		
//		destroyWidget: function(/*Widget*/ widget){
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

		getContainerNode: function(/*Widget*/ widget){
			// summary:
			//		Overriden to only return the container node if this is not a href ContentPane
			//
			if(!widget){
				return undefined;
			}
			widget=widget.dijitWidget;

			// FIXME: should use davinci.ve.widget.getProperty(widget, "href") to get the href?
			if(widget.href){
				return undefined;
			}
			return (widget.containerNode || widget.domNode);
		}

});
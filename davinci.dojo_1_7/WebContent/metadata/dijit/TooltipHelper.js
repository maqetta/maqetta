dojo.provide("davinci.libraries.dojo.dijit.TooltipHelper");

dojo.declare("davinci.libraries.dojo.dijit.TooltipHelper", null, {

		popup: function(widget){
			var connectId = widget.attr("connectId");
			if(!connectId){ return; }
			if(connectId.length){
				// just show the first
				connectId = connectId[0];
			}
			var dijit = widget.getContext().getDijit();
			dijit.showTooltip(widget.domNode.innerHTML, davinci.ve.widget.byId(connectId).domNode);
		},

		tearDown: function(widget){
			var connectId = widget.attr("connectId");
			if(!connectId){ return; }
			if(connectId.length){
				// just show the first
				connectId = connectId[0];
			}
			var dijit = widget.getContext().getDijit();
			dijit.hideTooltip(davinci.ve.widget.byId(connectId).domNode);
			return true;
		},

		getSelectNode: function(context){
			return context.getDijit()._masterTT.domNode;
		}
});
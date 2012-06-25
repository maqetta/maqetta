define(function(){

var TooltipHelper = function() {};
TooltipHelper.prototype = {

	create: function(widget) {
		var connectId = widget.attr("connectId");
		if (!connectId || connectId.length === 0) {
			return;
		}
		if (widget.getContext().getDojo().isArray(connectId)) {
			connectId = connectId[0];
		}

		widget._ownerId = connectId;
	},

	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle processing should proceed
	 */
	onToggleVisibility: function(widget, on) {
		return false;
	},

	onSelect: function(widget) {
		var connectId = widget.attr("connectId");
		if (!connectId || connectId.length === 0) {
			return;
		}
		if (widget.getContext().getDojo().isArray(connectId)) {
			// just show the first
			connectId = connectId[0];
		}
		var dijit = widget.getContext().getDijit();
		dijit.showTooltip(widget.domNode.innerHTML, davinci.ve.widget.byId(connectId).domNode);
	},

	onDeselect: function(widget){
		var connectId = widget.attr("connectId");
		if (!connectId || connectId.length === 0) {
			return;
		}
		if (widget.getContext().getDojo().isArray(connectId)) {
			connectId = connectId[0];
		}
		var dijit = widget.getContext().getDijit();
		dijit.hideTooltip(davinci.ve.widget.byId(connectId).domNode);
		return true;
	},

	getSelectNode: function(context){
//		var master = context.getGlobal().require("dijit/Tooltip")._masterTT;
		var master = context.getDijit().Tooltip._masterTT;
		return master && master.domNode;
	}

};

return TooltipHelper;

});
define([
], function(){
return function() {

	this.create = function(widget) {

	};

	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle processing should proceed
	 */
	this.onToggleVisibility = function(widget, on) {
		return false;
	};

	this.onSelect = function(widget) {
		var connectId = widget.attr("connectId");
		if (!connectId || connectId.length == 0) { return; }
		if (widget.getContext().getDojo().isArray(connectId)) {
			// just show the first
			connectId = connectId[0];
		}
		var dijit = widget.getContext().getDijit();
		dijit.showTooltip(widget.domNode.innerHTML, davinci.ve.widget.byId(connectId).domNode);
	};

	this.onDeselect = function(widget){
		var connectId = widget.attr("connectId");
		if(!connectId || connectId.length == 0) { return; }
		if(widget.getContext().getDojo().isArray(connectId)) {
			// just show the first
			connectId = connectId[0];
		}
		var dijit = widget.getContext().getDijit();
		dijit.hideTooltip(davinci.ve.widget.byId(connectId).domNode);
		return true;
	};

	this.getSelectNode = function(context){
		return context.getDijit()._masterTT.domNode;
	};
};
});
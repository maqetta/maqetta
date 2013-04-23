define(function() {

	var Helper = function() {};
	Helper.prototype = {

		
		
		create: function(widget, srcElement) {
			/*
			 * HTML treats the presents of a boolean attribute as true even if the
			 * attribute is set to "false" So the boolean from maqetta is "false"
			 * we need to remove the attribute to make HTML happy
			 * these are all the boolean attributes.
			 */
			if (widget.properties) {
				widget.domNode.disabled = widget.properties.disabled;
				if (widget.domNode.disabled == false) {
					widget.domNode.removeAttribute('disabled');
				} else {
					widget.domNode.setAttribute('disabled', true);
				}
				widget.domNode.checked = widget.properties.checked;
				if (widget.domNode.checked == false) {
					widget.domNode.removeAttribute('checked');
				} else {
					widget.domNode.setAttribute('checked', true);
				}
				widget.domNode.autofocus = widget.properties.autofocus;
				if (widget.domNode.autofocus == false) {
					widget.domNode.removeAttribute('autofocus');
				} else {
					widget.domNode.setAttribute('autofocus', true);
				}
				widget.domNode.readonly = widget.properties.readonly;
				if (widget.domNode.readonly == false) {
					widget.domNode.removeAttribute('readonly');
				} else {
					widget.domNode.setAttribute('readonly', true);
				}
				widget.domNode.required = widget.properties.required;
				if (widget.domNode.required == false) {
					widget.domNode.removeAttribute('required');
				} else {
					widget.domNode.setAttribute('required', true);
				}
				widget.domNode.multiple = widget.properties.multiple;
				if (widget.domNode.multiple == false) {
					widget.domNode.removeAttribute('multiple');
				} else {
					widget.domNode.setAttribute('multiple', true);
				}
				widget.domNode.autoplay = widget.properties.autoplay;
				if (widget.domNode.autoplay == false) {
					widget.domNode.removeAttribute('autoplay');
				} else {
					widget.domNode.setAttribute('autoplay', true);
				}
				widget.domNode.controls = widget.properties.controls;
				if (widget.domNode.controls == false) {
					widget.domNode.removeAttribute('controls');
				} else {
					widget.domNode.setAttribute('controls', true);
				}
				widget.domNode.loop = widget.properties.loop;
				if (widget.domNode.loop == false) {
					widget.domNode.removeAttribute('loop');
				} else {
					widget.domNode.setAttribute('loop', true);
				}
				widget.domNode.muted = widget.properties.muted;
				if (widget.domNode.muted == false) {
					widget.domNode.removeAttribute('muted');
				} else {
					widget.domNode.setAttribute('muted', true);
				}
				
				
			}
		}


	};

	return Helper;

});
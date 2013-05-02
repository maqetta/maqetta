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
			var boolAttr = ['disabled', 'checked', 'autofocus', 'readonly', 
			                'required', 'multiple', 'autoplay', 'controls', 
			                'loop', 'muted'
			                ];
	
			if (widget.properties) {
				boolAttr.forEach(function(attr){
					widget.domNode[attr] = widget.properties[attr];
					if (widget.domNode[attr] == false) {
						widget.domNode.removeAttribute(attr);
					} else {
						widget.domNode.setAttribute(attr, true);
					}
				});
			}
		}


	};

	return Helper;

});
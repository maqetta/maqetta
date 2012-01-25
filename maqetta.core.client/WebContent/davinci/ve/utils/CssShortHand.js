define([
], function() {
	
return /** @scope davinci.ve.utils.CssShortHand */ {

	map:{
			 'border' : ['border-width', 'border-style','border-color', 'border-top', 'border-left', 'border-right', 'border-bottom'],
			 'border-width'  : ['border-top-width','border-right-width','border-bottom-width','border-left-width'],
			 'border-style'  : ['border-top-style','border-right-style','border-bottom-style','border-left-style'],
			 'border-color'  : ['border-top-color','border-right-color','border-bottom-color','border-left-color'],
			 'border-bottom' : ['border-bottom-width', 'border-bottom-style','border-bottom-color'],
			 'border-top' 	 : ['border-top-width', 'border-top-style','border-top-color'],
			 'border-left'   : ['border-left-width', 'border-left-style','border-left-color'],
			 'border-right'  : ['border-right-width', 'border-right-style','border-right-color'],
			 'font'  : ['font-size', 'line-height','font-weight','font-style','font-family'],
			 'border-radius'  : ['border-top-left-radius', 'border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius'],
			 '-moz-border-radius'  : ['-moz-border-radius-topleft', '-moz-border-radius-topright','-moz-border-radius-bottomright','-moz-border-radius-bottomleft']
	}	
};
});
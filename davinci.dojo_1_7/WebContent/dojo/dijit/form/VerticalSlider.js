define([
	"dojo",
	"..",
	"dojo/text!./templates/VerticalSlider.html",
	"./HorizontalSlider"], function(dojo, dijit, template){

	// module:
	//		dijit/form/VerticalSlider
	// summary:
	//		A form widget that allows one to select a value with a vertically draggable handle


	dojo.declare("dijit.form.VerticalSlider", dijit.form.HorizontalSlider, {
		// summary:
		//		A form widget that allows one to select a value with a vertically draggable handle

		templateString: template,
		_mousePixelCoord: "pageY",
		_pixelCount: "h",
		_startingPixelCoord: "y",
		_startingPixelCount: "t",
		_handleOffsetCoord: "top",
		_progressPixelSize: "height",

		// _descending: Boolean
		//		Specifies if the slider values go from high-on-top (true), or low-on-top (false)
		//		TODO: expose this in 1.2 - the css progress/remaining bar classes need to be reversed
		_descending: true,

		_isReversed: function(){
			// summary:
			//		Overrides HorizontalSlider._isReversed.
			//		Indicates if values are high on top (with low numbers on the bottom).
			return this._descending;
		}
	});


	return dijit.form.VerticalSlider;
});

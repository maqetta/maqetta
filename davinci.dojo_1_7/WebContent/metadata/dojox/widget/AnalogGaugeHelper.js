define([
	"dojo/_base/lang",
	"./_GaugeHelper"
], function(
	lang,
	_GaugeHelper
) {

var AnalogGaugeHelper = {
	// _widget: String
	// 		Override for AnalogGauge.
	_widget: "AnalogGauge",

	_postCreate: function(){
		// summary:
		// 		stop _Gauge from displaying the master tooltip in its postCreate (causes errors)
		//

		// this=AnalogGauge
		var oldUseTooltip=this.useTooltip;
		this.useTooltip=false;
		// delete copied private data
		if(this.majorTicks){ delete this.majorTicks._ticks; }
		if(this.minorTicks){ delete this.minorTicks._ticks; }
		lang.hitch(this, AnalogGaugeHelper._oldPostCreate)();
		this.useTooltip=oldUseTooltip;
	}

};

lang.mixin(AnalogGaugeHelper, _GaugeHelper);

return AnalogGaugeHelper;

});
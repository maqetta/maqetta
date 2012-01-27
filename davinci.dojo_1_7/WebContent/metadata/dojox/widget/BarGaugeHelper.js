define([
	"dojo/_base/lang",
	"./_GaugeHelper"
], function(
	lang,
	_GaugeHelper
) {

var BarGaugeHelper = {
	// _widget: String
	// 		Override for BarGauge.
	_widget: "BarGauge",

	_postCreate: function(){
		// stop tooltip from displaying
		// this=AnalogGauge
		var oldUseTooltip=this.useTooltip;
		this.useTooltip=false;
		// delete copied private data
		if(this.majorTicks){ delete this.majorTicks._ticks; }
		if(this.minorTicks){ delete this.minorTicks._ticks; }
		lang.hitch(this, BarGaugeHelper._oldPostCreate)();
		this.useTooltip=oldUseTooltip;
	}
};

lang.mixin(BarGaugeHelper, _GaugeHelper);

return BarGaugeHelper;

});
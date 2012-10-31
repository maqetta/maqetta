define([
	"dojo/_base/declare",
	"./_GaugeHelper"
], function(
	declare,
	_GaugeHelper
) {

return declare(_GaugeHelper, {
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
		this._oldPostCreate();
		this.useTooltip=oldUseTooltip;
	}
});

});
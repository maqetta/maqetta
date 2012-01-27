define([
	"dojo/_base/declare",
	"./_GaugeHelper"
], function(
	declare,
	_GaugeHelper
) {

return declare(_GaugeHelper, {
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
		this_oldPostCreate();
		this.useTooltip=oldUseTooltip;
	}

});

});
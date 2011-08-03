dojo.provide("davinci.libraries.dojo.dojox.gauges.AnalogGaugeHelper");

dojo.require("davinci.libraries.dojo.dojox.gauges._GaugeHelper");

dojo.declare("davinci.libraries.dojo.dojox.gauges.AnalogGaugeHelper", davinci.libraries.dojo.dojox.gauges._GaugeHelper, {
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
		dojo.hitch(this,dojo.metadata.dojox.gauges.AnalogGaugeHelper._oldPostCreate)();
		this.useTooltip=oldUseTooltip;
	}
});
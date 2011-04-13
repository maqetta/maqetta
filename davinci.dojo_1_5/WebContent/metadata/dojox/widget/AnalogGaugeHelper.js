dojo.provide("davinci.libraries.dojo.dojox.widget.AnalogGaugeHelper");

dojo.require("davinci.libraries.dojo.dojox.widget._GaugeHelper");

dojo.declare("davinci.libraries.dojo.dojox.widget.AnalogGaugeHelper", davinci.libraries.dojo.dojox.widget._GaugeHelper, {
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
		dojo.hitch(this,dojo.metadata.dojox.widget.AnalogGaugeHelper._oldPostCreate)();
		this.useTooltip=oldUseTooltip;
	}
});
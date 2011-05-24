dojo.provide("davinci.libraries.dojo.dojox.widget.BarGaugeHelper");

dojo.require("davinci.libraries.dojo.dojox.widget._GaugeHelper");

dojo.declare("davinci.libraries.dojo.dojox.widget.BarGaugeHelper", davinci.libraries.dojo.dojox.widget._GaugeHelper, {
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
		dojo.hitch(this,dojo.metadata.dojox.widget.BarGaugeHelper._oldPostCreate)();
		this.useTooltip=oldUseTooltip;
	}
});
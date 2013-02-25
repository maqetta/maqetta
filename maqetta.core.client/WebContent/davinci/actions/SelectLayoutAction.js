define([
      "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"dojo/i18n!./nls/actions"
], function(declare,  Action, Workbench, langObj){

return declare("davinci.actions.SelectLayoutAction", Action, {
	
	_changeLayoutCommand: function(newLayout){
		var d = dijit.byId('selectLayout');
		if (d){
			d.destroyRecursive(false);
		}
		var e = Workbench.getOpenEditor();
		if (e && e.getContext){
			var flowLayout = true;
			if (newLayout === 'absolute' || newLayout === 'Absolute positioning'){
				flowLayout = false;
			} 
			var c = e.getContext();
			c.setFlowLayout(flowLayout);
			e._visualChanged();
		}
	}

});
});


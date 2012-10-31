define([
    	"dojo/_base/declare",
    	"davinci/Workbench",
    	"davinci/actions/Action"
], function(declare, Workbench, Action){


return declare("davinci.ve.actions.RotateDeviceAction", [Action], {

	run: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		var context = e.getContext();
		context.visualEditor.toggleOrientation();		
	},
	
	isEnabled: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.getContext){
			var context = e.getContext();
			if(context.getMobileDevice){
				var device = context.getMobileDevice();
				return (device && device != '' && device != 'none' && device != 'desktop');
			}else{
				return false;
			}
		}else{
			return false;
		}
	},
	
	updateStyling: function(){
		var landscape = false;
		var editor = davinci.Workbench.getOpenEditor();
		if(editor){
			var visualEditor = editor.visualEditor;
			if(visualEditor && visualEditor.getOrientation){
				var orientation = visualEditor.getOrientation();
				landscape = (orientation == 'landscape');
			}
		}
		var landscapeClass = 'orientationLandscape';
		if(landscape){
			dojo.addClass(document.body, landscapeClass);
		}else{
			dojo.removeClass(document.body, landscapeClass);
		}
	}
});
});
dojo.provide("davinci.libraries.dojo.dojox.mobile.ThemeHelper");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ThemeHelper", null, {

	
	getHeadStyleString: function(){
	    debugger;
	   
	    return '';
	},
	
	preThemeConfig: function(context){
	    debugger;
	    context.getDojo()["require"]("dojox.mobile");
        var dm = context.getDojo().getObject("dojox.mobile", true);

        // Pull in _compat.js immediately, since it redefines methods like loadCssFile which we wish to add advice to now
        context.getDojo()["require"]("dojox.mobile.compat");
       // dm.themeMap.unshift([".*","android",["mobile2.css"]]);
        dm.themeMap=[[".*","android",["mobile2.css"]]];
       // dm.loadDeviceTheme('mobile2');
	}

});
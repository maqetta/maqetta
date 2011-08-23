dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewCreateTool");

dojo.require("davinci.ve.Context");
dojo.require("davinci.ve.widget");
dojo.require("davinci.libraries.dojo.dojox.mobile.MobileCreateTool");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("davinci.ve.commands.ReparentCommand");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.dojo.dojox", "dojox");
dojo.requireLocalization("dijit", "common");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewCreateTool", davinci.libraries.dojo.dojox.mobile.MobileCreateTool, {
    // post a dialog asking user whether this View should be child
	// of BODY or View widget into which it was dropped
	//FIXME: Various things that aren't quite right:
	//  This routine does a cleanup-after-operation to reparent the View. 
	//  Should instead head off at pass and set parent before widget is added.
	//  Because of this cleanup-after-operation, outline palette temporarily shows original parenting.
	//  Also, might want to integrate with a future UI feature where on a general basis
	//  we allow user to pick the desired parent for the widget.
    create: function(args) {
        
        this.inherited(arguments);
        if(args && args.target && args.target.domNode && args.target.domNode.nodeName!="BODY"){
        	var target = args.target;
	        var langObj = dojo.i18n.getLocalization("davinci.libraries.dojo.dojox", "dojox");
	    	var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
	    	var	dialog = new dijit.Dialog({
	    		id: "ViewCreateToolDialog",
	    		title:langObj.viewCreateDialogTitle,
	    		onCancel:function(){
	    			davinci.libraries.dojo.dojox.mobile.ViewCreateTool.prototype.ViewCreateToolClose();
	    		}
	    	});
	    	var formHTML='<form name="ViewCreateToolForm">';
	    	formHTML+='<div style="margin:.5em 0">';
	    	formHTML+='<input type="radio" name="targetParent" checked="true" value="bodyParent"/>';
	    	formHTML+=' <label for="bodyParent">'+langObj.viewCreateDialogChildOf+' &lt;body&gt;</label>';
	    	formHTML+='</div>';
	    	formHTML+='<div style="margin:.5em 0">';
	    	formHTML+='<input type="radio" name="targetParent" value="otherParent"/>';
	    	formHTML+=' <label for="bodyParent">'+langObj.viewCreateDialogChildOf+' ';
	    	var type = target.type ? target.type : "";
	    	var id = target.domNode.id ? target.domNode.id : "";
	    	formHTML+=type+' (#'+id+')</label>';
	       	formHTML+='</div>';
	       	formHTML+='<div style="text-align:center"><span id="ViewCreateToolOKButton" dojoType="dijit.form.Button" ';
	       	formHTML+=    'label="'+dijitLangObj.buttonOk+'"';
	       	formHTML+=    'onClick="davinci.libraries.dojo.dojox.mobile.ViewCreateTool.prototype.ViewCreateToolClose()"';
	       	formHTML+='/></div>';
	       	formHTML+='</form>';
	    	dialog.setContent(formHTML);
	    	var okWidget = dijit.byId('ViewCreateToolOKButton');
	    	dialog.connect(okWidget,'onclick',function(){alert('hi');});
	    	dialog._viewWidget = this._widget;
	    	dialog._viewTarget = target;
	    	dialog._viewWidgetContext = this._context;
	    	dialog.show();
        }else{
        	davinci.ve.states.setState(this._context.rootWidget, this._widget.domNode.id, true, false);
        }
     },
     
     ViewCreateToolClose: function(){
    	 var value="bodyParent";
    	 for (var i=0; i < document.ViewCreateToolForm.targetParent.length; i++){
    		 if(document.ViewCreateToolForm.targetParent[i].checked){
    			 value = document.ViewCreateToolForm.targetParent[i].value;
    			 break;
    		 }
    	 }
    	 var dialog = dijit.byId('ViewCreateToolDialog');
    	 var viewWidget = dialog._viewWidget;
    	 var viewTarget = dialog._viewTarget;
    	 var context = dialog._viewWidgetContext;
    	 dialog.hide();
    	 dialog.destroyRecursive();
    	 if(value=="bodyParent"){
     		var command = new davinci.ve.commands.ReparentCommand(viewWidget, context.rootWidget, undefined);
    		context.getCommandStack().execute(command);
    		//FIXME: May need to do same reselect business for other reparent commands.
    		context.select(null);
    		context.select(viewWidget);
    		davinci.ve.states.setState(context.rootWidget, viewWidget.domNode.id, true, false);
    	 }else{
    		 var nearestParentViewMgr = davinci.ve.states.nearestParentViewMgr(viewTarget);
    		 davinci.ve.states.setState(nearestParentViewMgr, viewWidget.domNode.id, true, false);
    	 }
     }
});
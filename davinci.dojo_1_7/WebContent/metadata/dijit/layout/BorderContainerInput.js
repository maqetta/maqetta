define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-style",
	"dijit/registry",
	"dijit/Dialog",
	"./ContainerInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!../nls/dijit"
], function(
	declare,
	lang,
	dom,
	style,
	registry,
	Dialog,
	ContainerInput,
	Widget,
	ModifyCommand,
	commonNls,
	veNls,
	dijitNls
) {

return declare("davinci.libraries.dojo.dijit.layout.BorderContainerInput", ContainerInput, {
	
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);
		if (!this._inline) {
			this._inline = new Dialog({
                title: dijitNls.borderContainerDialog,
                style: "width: 350px; height:350px"
            });
			this._inline.onCancel = lang.hitch(this, "cancel");
			this._inline.callBackObj = this;
            // XXX TODO This (and the hitching that follows) should all be handled in a template!
			var s = '<div id="davinci.libraries.dojo.dijit.layout.BorderContainerInput_div" >';
			s +='<div dojoType="dijit.layout.BorderContainer" design="headline" gutters="false" style="width: 325px; height:285px" liveSplitters="true" id="borderContainer">';
			s += '	<div dojoType="dijit.layout.LayoutContainer" style="height: 3em;" region="top">';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="left" style="width: 100px">'+dijitNls.borderDesign+'</div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="client" style="width: 100px"><input type="radio" dojoType="dijit.form.RadioButton" name="headline" id="headlineRadio" value="headline" /> <label for="headlineRadio"> '+dijitNls.borderHeadline+'  </label></div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="right" ><input type="radio" dojoType="dijit.form.RadioButton" name="sidebar" id="sidebarRadio" value="sidebar" /> <label for="sidebarRadio"> '+dijitNls.borderSidebar+'  </label></div>';
			s += '	</div>';
			s += '	<div dojoType="dijit.layout.ContentPane" style="width: 7em;" region="leading">';
			s += '		<table>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="left" id="leftCheckBox" value="left" /> <label for="leftCheckBox"> '+dijitNls.borderLeft+'  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="right" id="rightCheckBox" value="right" /> <label for="rightCheckBox"> '+dijitNls.borderRight+'  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="top" id="topCheckBox" value="top" /> <label for="topCheckBox"> '+dijitNls.borderTop+'  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="bottom" id="bottomCheckBox" value="bottom" /> <label for="bottomCheckBox"> '+dijitNls.borderBottom+'  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="center" id="centerCheckBox" value="center" /> <label for="centerCheckBox"> '+dijitNls.borderCenter+'  </label></td></tr>';
	        s += '		</table>';
			s += '	</div>';
			s += '	<div dojoType="dijit.layout.ContentPane"  region="center" id="centerWorkspace">';
			s += '		<div dojoType="dijit.layout.BorderContainer" design="headline" gutters="true" liveSplitters="true" id="workspaceBorderContainer">';
	        s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="left">  </div>';
	        s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="right">  </div>';
	        s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="top">  </div>';
	        s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="bottom">  </div>';
	        s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="center">  </div>';
	        s += '		</div>';
	        s += '	</div>';
	        s += '	<div dojoType="dijit.layout.LayoutContainer" style="height: 4em;" region="bottom">';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="left" style="width: 100px"></div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="client" style="width: 100px"><button dojoType="dijit.form.Button" type="button" id="okButton" > '+commonNls.buttonOk+' </button></div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="right" ><button dojoType="dijit.form.Button" type="button" id="cancelButton"> '+commonNls.buttonCancel+' </button></div>';
			s += '	</div>';
			s += '</div>';
			s += '</div>';
			
			this._inline.attr("content", s);
			this._inline.show();
	
			var obj = dom.byId('davinci.libraries.dojo.dijit.layout.BorderContainerInput_div');
			obj.onkeypress = lang.hitch(this,"onKeyPress");
			obj = registry.byId('sidebarRadio');
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('headlineRadio');
			obj.setChecked(false);
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('leftCheckBox');
			obj.setChecked(false);
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('rightCheckBox');
			obj.setChecked(false);
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('topCheckBox');
			obj.setChecked(false);
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('bottomCheckBox');
			obj.setChecked(false);
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('centerCheckBox');
			obj.setChecked(false);
			obj.onClick = lang.hitch(this, "onChange");
			obj = registry.byId('okButton');
			obj.onClick = lang.hitch(this, "updateWidget");
			style.set('okButton', "width", "50px");
			obj = registry.byId('cancelButton');
			obj.onClick = lang.hitch(this, "cancel");
			style.set('cancelButton', "width", "50px");
			if (this._widget.inLineEdit_displayOnCreate){
				// hide cancel on widget creation #120
				delete this._widget.inLineEdit_displayOnCreate;
				style.set(obj.domNode, "display", "none");
			}
			this.updateDialog();
		}
	},
	
	onKeyPress: function(event){
		if (event.keyCode == 13) {
			this.updateWidget();
		}
	},
			
	onChange: function(event){
		var checked = 0;
		var obj = registry.byId('leftCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = registry.byId('rightCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = registry.byId('topCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = registry.byId('bottomCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = registry.byId('centerCheckBox');
		checked += obj.checked ? 1 : 0;
		if (checked < 1){
			obj = registry.byId(event.currentTarget.id);
			obj.setChecked(true);
			alert(veNls.regionMustBeSelected);
		}

		if (event.target.id === 'headlineRadio'){
			obj = registry.byId('headlineRadio');
			obj.setChecked(true);
			obj = registry.byId('sidebarRadio');
			obj.setChecked(false);
		} else if (event.target.id === 'sidebarRadio'){
			obj = registry.byId('headlineRadio');
			obj.setChecked(false);
			obj = registry.byId('sidebarRadio');
			obj.setChecked(true);
		} else if (event.target.id === 'okButton_label'){
			this.updateWidget();
		} else if (event.target.id === 'cancelButton_label'){
			return;
		}
		this.updateDesign();
	},
	
	updateDesign: function(){
		var obj = registry.byId('headlineRadio'),
			type;
		if (obj.checked){
			type = 'headline';
		}else{
			type = 'sidebar';
		}
		var s = '	<div dojoType="dijit.layout.BorderContainer" design="'+type+'" gutters="true" liveSplitters="true" id="workspaceBorderContainerSidebar">';
		obj = registry.byId('leftCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="left">  </div>';
		}
		obj = registry.byId('rightCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="right">  </div>';
		}
		obj = registry.byId('topCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="top">  </div>';
		}
        obj = registry.byId('bottomCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="bottom">  </div>';
		}
        obj = registry.byId('centerCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="center">  </div>';
		}
        s += '		</div>';
        obj = registry.byId('centerWorkspace');
        obj.attr("content", s);
	},
	
	updateWidget: function(){
		var region = {};
		var obj = registry.byId('headlineRadio');
		var type = obj.checked ? 'headline' : 'sidebar';
		obj = registry.byId('leftCheckBox');
		region.left = obj.checked ? true : false;
		obj = registry.byId('rightCheckBox');
		region.right = obj.checked ? true : false;
		obj = registry.byId('topCheckBox');
		region.top = obj.checked ? true : false;
        obj = registry.byId('bottomCheckBox');
        region.bottom = obj.checked ? true : false;
        obj = registry.byId('centerCheckBox');
        region.center = obj.checked ? true : false;
        this.cancel();
        var data = this._widget.getData(); 
        data.properties.design = type;
        var newChildren = [];
        for (var i=0; i<data.children.length; i++){
        	var regionName = data.children[i].properties.region;
        	var addRegion = region[regionName];
        	if (addRegion){
        		newChildren[newChildren.length] = data.children[i];
        	}
        	delete region[regionName];
        	
        }
        for (var r in region){
        	//var name = '' + r;
        	if (region[r]){ 
        		// add region
        		var child = lang.clone(data.children[0]);
        		child.properties.region = r;
        		delete child.properties.id; 
        		//child.properties.style = 'height: 50px; top: 0px; left: 0px; right: 0px';
        		if (r == 'top' || r == 'bottom') {
        			child.properties.style = 'height: 50px;';
        		} else if ( r == 'left' || r == 'right') {
        			child.properties.style = 'width: 50px;';
        		} else {
        			delete child.properties.style;
        		}
        		newChildren[newChildren.length] = child;
        		
        	}
       }

        if (data.properties.isTempID){
        	delete data.properties.id; // delete temp id so it does not make it's way out to the source
        }
        var command = new ModifyCommand(this._widget, data.properties, newChildren, this._widget._edit_context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget=command.newWidget;
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
		var context=this._widget.getContext();
		context.select(this._widget, null, false); // redraw the box around the widget
	},
	
	cancel: function(){
		this._inline.destroyDescendants();
		this._inline.destroy();
        delete this._inline;
	},
	
	updateDialog: function(){
        var data = this._widget.getData(),
            headlineRadio = registry.byId('headlineRadio'),
            sidebarRadio = registry.byId('sidebarRadio'),
            obj;
        if (data.properties.design && data.properties.design === 'sidebar'){
        	headlineRadio.setChecked(false);
        	sidebarRadio.setChecked(true);
        } else {
        	headlineRadio.setChecked(true);
        	sidebarRadio.setChecked(false);
        }
        for (var i=0; i <  data.children.length; i++){
        	var regionCheckBox = data.children[i].properties.region + 'CheckBox';
        	obj = registry.byId(regionCheckBox);
    		obj.setChecked(true);
        }
        // the center pane is require for border container
        obj = registry.byId('centerCheckBox');
		obj.setChecked(true);
		obj.set('disabled', true);
        
        this.updateDesign();
	}
});

});
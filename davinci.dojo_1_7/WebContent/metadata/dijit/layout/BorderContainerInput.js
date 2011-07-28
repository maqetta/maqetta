dojo.provide("davinci.libraries.dojo.dijit.layout.BorderContainerInput");
dojo.require("davinci.libraries.dojo.dijit.layout.ContainerInput");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.LayoutContainer");

dojo.declare("davinci.libraries.dojo.dijit.layout.BorderContainerInput", davinci.libraries.dojo.dijit.layout.ContainerInput, {
	
	show: function(widgetId){
	//debugger;
	this._widget = davinci.ve.widget.byId(widgetId);
		if (!this._inline) {
			this._inline = new dijit.Dialog({
                title: "Border Container Dialog",
                style: "width: 350px; height:350px"
            });
			this._inline.onCancel = dojo.hitch(this, "cancel");
			this._inline.callBackObj = this;
			var s = '<div dojoType="dijit.layout.BorderContainer" design="headline" gutters="false" style="width: 325px; height:285px" liveSplitters="true" id="borderContainer">';
			s += '	<div dojoType="dijit.layout.LayoutContainer" style="height: 3em;" region="top">';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="left" style="width: 100px">Design</div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="client" style="width: 100px"><input type="radio" dojoType="dijit.form.RadioButton" name="headline" id="headlineRadio" value="headline" /> <label for="headlineRadio"> Headline  </label></div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="right" ><input type="radio" dojoType="dijit.form.RadioButton" name="sidebar" id="sidebarRadio" value="sidebar" /> <label for="sidebarRadio"> Sidebar  </label></div>';
			s += '	</div>';
			s += '	<div dojoType="dijit.layout.ContentPane" style="width: 7em;" region="leading">';
			s += '		<table>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="left" id="leftCheckBox" value="left" /> <label for="leftCheckBox"> Left  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="right" id="rightCheckBox" value="right" /> <label for="rightCheckBox"> Right  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="top" id="topCheckBox" value="top" /> <label for="topCheckBox"> Top  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="bottom" id="bottomCheckBox" value="bottom" /> <label for="bottomCheckBox"> Bottom  </label></td></tr>';
	        s += '			<tr><td><input type="radio" dojoType="dijit.form.CheckBox" name="center" id="centerCheckBox" value="center" /> <label for="centerCheckBox"> Center  </label></td></tr>';
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
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="client" style="width: 100px"><button dojoType="dijit.form.Button" type="button" id="okButton" > Ok </button></div>';
			s += '		<div dojoType="dijit.layout.ContentPane" layoutAlign="right" ><button dojoType="dijit.form.Button" type="button" id="cancelButton"> Cancel </button></div>';
			s += '	</div>';
			s += '</div>'
			
			this._inline.attr("content", s);
			this._inline.show();
			var obj = dijit.byId('sidebarRadio');
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('headlineRadio');
			obj.setChecked(false);
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('leftCheckBox');
			obj.setChecked(false);
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('rightCheckBox');
			obj.setChecked(false);
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('topCheckBox');
			obj.setChecked(false);
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('bottomCheckBox');
			obj.setChecked(false);
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('centerCheckBox')
			obj.setChecked(false);;
			obj.onClick = dojo.hitch(this, "onChange");
			obj = dijit.byId('okButton');
			obj.onClick = dojo.hitch(this, "updateWidget");
			dojo.style('okButton', "width", "50px");
			obj = dijit.byId('cancelButton');
			obj.onClick = dojo.hitch(this, "cancel");
			dojo.style('cancelButton', "width", "50px");
			this.updateDialog();
			
		}
		
	//debugger;
	},
		
	onChange: function(event){
		//debugger;
		var checked = 0;
		var obj = dijit.byId('leftCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = dijit.byId('rightCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = dijit.byId('topCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = dijit.byId('bottomCheckBox');
		checked += obj.checked ? 1 : 0;
		obj = dijit.byId('centerCheckBox');
		checked += obj.checked ? 1 : 0;
		if (checked < 1){
			obj = dijit.byId(event.currentTarget.id);
			obj.setChecked(true);
			alert('At least one region must be selected.');
		}

		if (event.target.id === 'headlineRadio'){
			var obj = dijit.byId('headlineRadio');
			obj.setChecked(true);
			obj = dijit.byId('sidebarRadio');
			obj.setChecked(false);
		} else if (event.target.id === 'sidebarRadio'){
			var obj = dijit.byId('headlineRadio');
			obj.setChecked(false);
			obj = dijit.byId('sidebarRadio');
			obj.setChecked(true);
		} else if (event.target.id === 'okButton_label'){
			this.updateWidget();
		} else if (event.target.id === 'cancelButton_label'){
			//debugger;
			return;
		}
		this.updateDesign();
	},
	
	updateDesign: function(){
		//debugger;
		var obj = dijit.byId('headlineRadio');
		if (obj.checked){
			type = 'headline';
		}else{
			type = 'sidebar';
		}
		var s = '	<div dojoType="dijit.layout.BorderContainer" design="'+type+'" gutters="true" liveSplitters="true" id="workspaceBorderContainerSidebar">';
		obj = dijit.byId('leftCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="left">  </div>';
		}
		obj = dijit.byId('rightCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="right">  </div>';
		}
		obj = dijit.byId('topCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="top">  </div>';
		}
        obj = dijit.byId('bottomCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="bottom">  </div>';
		}
        obj = dijit.byId('centerCheckBox');
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="center">  </div>';
		}
        s += '		</div>';
        var obj = dijit.byId('centerWorkspace');
        obj.attr("content", s);

        //debugger;
		
	},
	
	updateWidget: function(){
		//debugger;
		var region = {};
		var obj = dijit.byId('headlineRadio');
		var type = obj.checked ? 'headline' : 'sidebar';
		obj = dijit.byId('leftCheckBox');
		region['left'] = obj.checked ? true : false;
		obj = dijit.byId('rightCheckBox');
		region['right'] = obj.checked ? true : false;
		obj = dijit.byId('topCheckBox');
		region['top'] = obj.checked ? true : false;
        obj = dijit.byId('bottomCheckBox');
        region['bottom'] = obj.checked ? true : false;
        obj = dijit.byId('centerCheckBox');
        region['center'] = obj.checked ? true : false;
        this.cancel();
        var data = this._widget.getData(); 
        data.properties.design = type;
        var newChildren = [];
        for (i=0; i<data.children.length; i++){
        	var regionName = data.children[i].properties.region;
        	var addRegion = region[regionName];
        	if (addRegion){
        		newChildren[newChildren.length] = data.children[i];
        	}
        	delete region[regionName];
        	
        }
        for (r in region){
        	var name = '' + r;
        	if (region[r]){ 
        		// add region
        		var child = dojo.clone(data.children[0]);
        		child.properties.region = r;
        		delete child.properties.id; 
        		//child.properties.style = 'height: 50px; top: 0px; left: 0px; right: 0px';
        		if (r == 'top' || r == 'bottom')
        			child.properties.style = 'height: 50px;';
        		else if ( r == 'left' || r == 'right')
        			child.properties.style = 'width: 50px;';
        		else 
        			delete child.properties.style;
        		newChildren[newChildren.length] = child;
        		
        	}
       }
        //debugger;
        if (data.properties.isTempID){
        	delete data.properties.id; // delete temp id so it does not make it's way out to the source
        }
        var command = new davinci.ve.commands.ModifyCommand(this._widget, data.properties, newChildren, this._widget._edit_context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget=command.newWidget;
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
		var context=this._widget.getContext();
		context.select(this._widget, null, false); // redraw the box around the widget
        //debugger;

	},
	
	
	cancel: function(){
		this._inline.destroyDescendants();
		this._inline.destroy();
        delete this._inline;
	},
	
	updateDialog: function(){
		//debugger;
        var data = this._widget.getData(); 
        var headlineRadio = dijit.byId('headlineRadio');
        var sidebarRadio = dijit.byId('sidebarRadio');
        if (data.properties.design && data.properties.design === 'sidebar'){
        	headlineRadio.setChecked(false);
        	sidebarRadio.setChecked(true);
        } else {
        	headlineRadio.setChecked(true);
        	sidebarRadio.setChecked(false);
        }
        for (i=0; i <  data.children.length; i++){
        	var regionCheckBox = data.children[i].properties.region + 'CheckBox';
        	var obj = dijit.byId(regionCheckBox);
    		obj.setChecked(true);
        }
        // the center pane is require for border container
        var obj = dijit.byId('centerCheckBox');
		obj.setChecked(true);
		obj.set('disabled', true);
        
        this.updateDesign();

	}
	

	
});
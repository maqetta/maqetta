define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-style",
	"dijit/registry",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"davinci/ui/Dialog",
	"./ContainerInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"dojo/text!./templates/borderContainerInput.html",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!davinci/ve/nls/ve",
	"dojo/i18n!../nls/dijit"
], function(
	declare,
	lang,
	dom,
	style,
	registry,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Dialog,
	ContainerInput,
	Widget,
	ModifyCommand,
	templateString,
	commonNls,
	veNls,
	dijitNls
) {

var ContinerInputWidget = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	templateString: templateString,

	dijitNls: dijitNls,

	resize: function(r) {
		this.borderContainer.resize(r);
	},
});

return declare(ContainerInput, {
	dijitNls: dijitNls,
	
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);

		this._input =  new ContinerInputWidget({});

		var hideCancel = false;
		if (this._widget.inLineEdit_displayOnCreate){
			// hide cancel on widget creation #120
			delete this._widget.inLineEdit_displayOnCreate;
			hideCancel = true;
		}

		this._inline = Dialog.showDialog({
			title: dijitNls.borderContainerDialog, 
			content: this._input, 
			style: {width: 560, height: 380}, 
			okCallback: lang.hitch(this, "updateWidget"), 
			okLabel: null, 
			hideCancel: hideCancel
		});

		this._input.domNode.onkeypress = lang.hitch(this,"onKeyPress");
		var obj = this._input.sidebarRadio;
		obj.onClick = lang.hitch(this, "onChange");
		obj = this._input.headlineRadio;             
		obj.setChecked(false);
		obj.onClick = lang.hitch(this, "onChange");
		obj = this._input.leftCheckBox;
		obj.setChecked(false);
		obj.onClick = lang.hitch(this, "onChange");
		obj = this._input.rightCheckBox;
		obj.setChecked(false);
		obj.onClick = lang.hitch(this, "onChange");
		obj = this._input.topCheckBox;
		obj.setChecked(false);
		obj.onClick = lang.hitch(this, "onChange");
		obj = this._input.bottomCheckBox;
		obj.setChecked(false);
		obj.onClick = lang.hitch(this, "onChange");
		obj = this._input.centerCheckBox;
		obj.setChecked(false);
		obj.onClick = lang.hitch(this, "onChange");
		this.updateDialog();

	},
	
	onKeyPress: function(event){
		if (event.keyCode == 13) {
			this.updateWidget();
		}
	},
			
	onChange: function(event){
		var checked = 0;
		var obj = this._input.leftCheckBox;
		checked += obj.checked ? 1 : 0;
		obj = this._input.rightCheckBox;
		checked += obj.checked ? 1 : 0;
		obj = this._input.topCheckBox;
		checked += obj.checked ? 1 : 0;
		obj = this._input.bottomCheckBox;
		checked += obj.checked ? 1 : 0;
		obj = this._input.centerCheckBox;
		checked += obj.checked ? 1 : 0;
		if (checked < 1){
			obj = registry.byId(event.currentTarget.id);
			obj.setChecked(true);
			alert(veNls.regionMustBeSelected);
		}

		if (event.target.name === 'headline'){
			obj = this._input.headlineRadio;
			obj.setChecked(true);
			obj = this._input.sidebarRadio;
			obj.setChecked(false);
		} else if (event.target.name === 'sidebar'){
			obj = this._input.headlineRadio;
			obj.setChecked(false);
			obj = this._input.sidebarRadio;
			obj.setChecked(true);
		}
		this.updateDesign();
	},
	
	updateDesign: function(){
		var obj = this._input.headlineRadio,
			type;
		if (obj.checked){
			type = 'headline';
		}else{
			type = 'sidebar';
		}
		var s = '	<div dojoType="dijit.layout.BorderContainer" design="'+type+'" gutters="true" liveSplitters="true" id="workspaceBorderContainerSidebar">';
		obj = this._input.leftCheckBox;
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="left">  </div>';
		}
		obj = this._input.rightCheckBox;
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="right">  </div>';
		}
		obj = this._input.topCheckBox;
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="top">  </div>';
		}
        obj = this._input.bottomCheckBox;
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="bottom">  </div>';
		}
        obj = this._input.centerCheckBox;
		if (obj.checked){
			s += '			<div dojoType="dijit.layout.ContentPane" splitter="true" region="center">  </div>';
		}
        s += '		</div>';
        obj = this._input.centerWorkspace;
        obj.attr("content", s);
	},
	
	updateWidget: function(){
		var region = {};
		var obj = this._input.headlineRadio;
		var type = obj.checked ? 'headline' : 'sidebar';
		obj = this._input.leftCheckBox;
		region.left = obj.checked ? true : false;
		obj = this._input.rightCheckBox;
		region.right = obj.checked ? true : false;
		obj = this._input.topCheckBox;
		region.top = obj.checked ? true : false;
        obj = this._input.bottomCheckBox;
        region.bottom = obj.checked ? true : false;
        obj = this._input.centerCheckBox;
        region.center = obj.checked ? true : false;
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
	
	updateDialog: function(){
        var data = this._widget.getData(),
            headlineRadio = this._input.headlineRadio,
            sidebarRadio = this._input.sidebarRadio,
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
        	obj = this._input[regionCheckBox];
    		obj.setChecked(true);
        }
        // the center pane is require for border container
        obj = this._input.centerCheckBox;
		obj.setChecked(true);
		obj.set('disabled', true);
        
        this.updateDesign();
	}
});

});
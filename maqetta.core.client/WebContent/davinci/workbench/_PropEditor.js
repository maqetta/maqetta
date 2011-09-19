dojo.provide("davinci.workbench._PropEditor");
dojo.require("dijit._Widget");
dojo.declare("davinci.workbench._PropEditor", [dijit._Widget],  {
	
	editor_id : "davinci.ve",
	_defaultUnits : "px",
	
	numbersOnlyRegExp: /(\d+)/,
	_changeSupressions : 0,
	__DEBUG_SEMIPHORES : false,
	
	_getEditor : function(type) {
			var editors = davinci.Runtime.getExtensions("davinci.prop.edit", ("davinci.ve" + "." + type));
			if (editors && editors.length > 0) {
				try {
					var cls = eval(editors[0].editor);
					var pane = new cls();
					pane.setContext(this._context);
					return pane;
				} catch (Ex) {
					debugger;
				}
			}else{ 
				console.log("No property editor found for type : " + type );
			}
			return null;
	},
	update : function(){
		
		
	},
	
	_changeValue : function(box, attr, value){
		if(box.attr && box.attr(attr)==value) return;
	
		if(box.setSelected){
			this._changeSupressions++;
			if(this.__DEBUG_SEMIPHORES) console.log("Supress Change!:" +this.declaredClass + ":"  + this._changeSupressions);
			box.setSelected(value);
			return;
		}
		//if(box.declaredClass!="dijit.form.NumberSpinner"){ 
			this._changeSupressions++;
			if(this.__DEBUG_SEMIPHORES)	console.log("Supress Change!:" +this.declaredClass + ":"  + this._changeSupressions);
		//}
		box.attr(attr, value);
		
	},
	_onChangeIntercept : function(arguments){
		return this.onChange(arguments);
		
		if(this._changeSupressions<1){
			if(this.__DEBUG_SEMIPHORES)	 console.log("firing change event:" +this.declaredClass);
		
		
		}else{
			this._changeSupressions--;
			if(this.__DEBUG_SEMIPHORES)	console.log("NOT firing change event:" +this.declaredClass + ":" + this._changeSupressions);
			
		}
		
	},
	
	_getDescriptorFor : function(category){
		var scriptor = (new davinci.ve.properties.CSSDescriptorProvider()).getDescriptor();
		var descriptor = {};
		for(var name in scriptor){
			var property = scriptor[name];
			if(property.category == category){
					descriptor[name] = property;
			}
		}
		return descriptor;
	},
	setContext : function(context){
		
		this.context = context;
	},
	shouldShow : function (){
		return true;
	}, 
	setValue : function(value){
		// set values for multiple values.
		
		this.value = value;
	},
	
	setName : function (name){
		this.name = name;
	},

	setSelected : function(selected){
		this.selected = selected;
			
		if(this.box) this.box.attr("value", this.selected);
	},
	setObjectIds : function (objectIds){
		this.objectIds = objectIds;	
	},
	getCommand: function(){
		
		
		
	},
	attr : function(value, setValue, priority){
		return this.box ? this.box.attr(value, setValue, priority) : null;
	},
	postCreate : function(){
		//debugger;
//		if(!this.box){ 
//			this.box = new dijit.form.TextBox({id: dojoy.edit.dialogs.getUniqueId(), name: this.name, value: (this.selected || "")});
//			this.connect(this.box,"onchange","onChange");
//		}
//		return this.box.domNode;
		
	},
	onChange : function (){
		//callback for when the property has changed and need to apply
		
		return true;
	}, 
	
	apply : function (){
		
		
	},
	
	_getEditor : function(type) {
		var editors = davinci.Runtime.getExtensions("davinci.prop.edit", ("davinci.ve" + "." + type));
		if (editors && editors.length > 0) {
			try {
				var cls = eval(editors[0].editor);
				var pane = new cls();
				pane.setContext(this._context);
				return pane;
			} catch (Ex) {
				debugger;
			}
		}else{ 
			console.log("No property editor found for type : " + type );
		}
		return null;
},
	getTableDomNode : function (){
		var table = dojo.doc.createElement("table");
		table.className = "propertiesPaneTable";
		table.dojoAttachPoint='containerNode';
		
		var col = dojo.doc.createElement("col");
		col.className = "propertiesNameColumn";
		
		table.appendChild(col);
		
		col = dojo.doc.createElement("col");
		col.className = "propertiesValueColumn";
		col.width="50";
		table.appendChild(col);
		
		return table;
	}
});
davinci.workbench._PropEditor._CSSUNITS = {
    '%' :  [100,95,90,85,80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5,0],
    'px' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50],
    'em' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50],
    'in' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50],
    'cm' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50],
    'mm' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50],
    'pt' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50],
    'pc' : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,40,50]	
}

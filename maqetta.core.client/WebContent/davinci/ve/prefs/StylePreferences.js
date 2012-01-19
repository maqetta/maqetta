define([
	"dojo/_base/declare",
	"dijit/layout/ContentPane",
	"dijit/_TemplatedMixin",
	"dijit/form/CheckBox",
	"dojo/i18n!davince/ve/nls/common"
], function(declare, ContentPane, TemplatedMixin, CheckBox, commonNls) {

return declare("davinci.ve.prefs.StylePreferences", [ContentPane, TemplatedMixin], {

	templateString: "<div><div dojoAttachPoint='prefContainer'></div></div>",
	defaultValues: {},
	
	postMixInProperties: function(){
		this._loc = commonNls;
	},	
	
	getTableDomNode : function (){
		var table = dojo.doc.createElement("table");
		
		var row = dojo.doc.createElement("tr");
		var cell = dojo.doc.createElement("td");
		
		cell.innerHTML = "&nbsp;";
		cell.className = "styleViewCol1";
		row.appendChild(cell);
		
		cell = dojo.doc.createElement("td");
		cell.innerHTML = "Standard";
		cell.className = "styleViewCol2";
		row.appendChild(cell);
		
		cell = dojo.doc.createElement("td");
		cell.innerHTML = "Category";
		cell.className = "styleViewCol3";
		row.appendChild(cell);
		
		cell = dojo.doc.createElement("td");
		cell.innerHTML = "Alphabetical";
		cell.className = "styleViewCol4";
		row.appendChild(cell);
		
		table.appendChild(row);
		return table;
	},
	
	_getDescriptorFor: function(category){

		var descriptor;
		if(!this._descriptor){
			dojo.xhrGet({
				url: "" + dojo.moduleUrl("davinci.ve.views.style", "metadata/css.json"),
				handleAs: "json",
				sync: true,
				load: function(result){descriptor = result;}
			});
			this._descriptor = descriptor; //FIXME: should make assignment in load callback
		}
		
		descriptor = {};
		
		for(var name in this._descriptor){
			var property = this._descriptor[name];
			if(property.category == category){
					descriptor[name] = property;
			}
		}
		return descriptor;
	},
	
	postCreate: function(){
		this.inherited(arguments);
		var table = this.getTableDomNode();
		dojo.forEach([
		    {name:"classes",label:"classes"},
			{name: "position", label: this._loc.position},
			{name: "size", label: this._loc.size},
			{name: "layout", label: this._loc.layout},
			{name: "visual", label: this._loc.visual},
			{name: "text", label: this._loc.text},
			{name: "border", label: this._loc.border},
			{name: "table", label: this._loc.table},
			{name: "list", label: this._loc.list},
			{name: "aural", label: this._loc.aural},
			{name: undefined, label: this._loc.others}
		], function(c){
			
			if(!this._boxes)
				this._boxes = {};
			
			
			var descriptor = this._getDescriptorFor(c.name);
			var __start = true;
			
			for(name in descriptor){
				if(__start){
					var row = dojo.doc.createElement("tr");
					var cell = dojo.doc.createElement("th");
					cell.colSpan="4";
					cell.className = "styleHeader";
					cell.innerHTML = c.label;
					row.appendChild(cell);
					table.appendChild(row);
					__start = false;
				}
				
				var props = descriptor[name];
				var row = dojo.doc.createElement("tr");
				var cell = dojo.doc.createElement("td");
			
				cell.innerHTML = name;
				row.appendChild(cell);
				this._boxes[name] = {};
				
				this._boxes[name]['davinci.ve.style.norm'] = new CheckBox({});
				this._boxes[name]['davinci.ve.style.alpha'] = new CheckBox({});
				this._boxes[name]['davinci.ve.style.cat'] = new CheckBox({});
				
				cell = dojo.doc.createElement("td");
				cell.align="center";
				cell.appendChild(this._boxes[name]['davinci.ve.style.norm'].domNode);
				row.appendChild(cell);
			
				cell = dojo.doc.createElement("td");
				cell.align="center";
				cell.appendChild(this._boxes[name]['davinci.ve.style.alpha'].domNode);
				row.appendChild(cell);
				
				cell = dojo.doc.createElement("td");
				cell.align="center";
				cell.appendChild(this._boxes[name]['davinci.ve.style.cat'].domNode);
				row.appendChild(cell);
				table.appendChild(row);
				
			}
		
		}, this);

		this.prefContainer.appendChild(table);
		if(!this.containerNode){
			this.containerNode = this.domNode;
		}
	},

	setPreferences: function(preferences){
		if(!preferences){
			
			preferences = this.getDefaults();
		}
		for(name in preferences){	
			for(page in preferences[name]){
				this._check( this._boxes[name][page], preferences[name][page]);
			}
		}
	},

	getDefaults: function () {
	},
	
	setDefaults: function () {
	},
	
	doApply: function () {
	},
	
	getPreferences: function(){

		var preferences = {};
		if(!this._boxes) return this.defaultValues;
		for(name in this._boxes){
			preferences[name] = {};
			
			preferences[name]['davinci.ve.style.norm'] = !!this._boxes[name]['davinci.ve.style.norm'].checked;
			preferences[name]['davinci.ve.style.alpha'] = !!this._boxes[name]['davinci.ve.style.alpha'].checked;
			preferences[name]['davinci.ve.style.cat'] = !!this._boxes[name]['davinci.ve.style.cat'].checked;
		}
		
		return preferences;
	},

	_check: function(widget, checked){
		if (widget.attr) {//dojo1.2
			widget.attr("checked", checked);
		}else {
			widget.setAttribute("checked", checked)
		}
	},

	getDefaults: function (){
		var p1 = dojo.xhrGet({url: "davinci/ve/prefs/default_style_prefs.js", sync: true, handleAs: "json"});
		return p1.results[0].defaultValues;
	}
});
});
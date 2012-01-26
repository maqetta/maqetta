define(["dojo/_base/declare",
        "dijit/_Widget",
        "dijit/layout/ContentPane",
        "davinci/ui/Panel",
        "system/resource",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dijit/TooltipDialog",
        "dijit/form/TextBox"
  ],function(declare, _Widget, ContentPane, Panel,Resource,uiNLS, commonNLS){
	return declare("davinci.ui.widgets.FolderSelection", [_Widget], {
		
		defaultFolder : null,
		
		buildRendering: function(){
			this.domNode =   dojo.doc.createElement("div",{style:"width:100%;height:100%;overflow:auto"});
			
			
			/*
			if(this.defaultFolder!=null)
				this.defaultFolder = system.resource.findResource(this.defaultFolder);//this._folder.attr('value');
			*/
			var filter= {filterList : function(list){
										var newList=[];
										for (var i=0;i<list.length;i++){
											var resource=list[i];
											if (resource.elementType=="Folder")
												newList.push(resource);
										}
										return newList;
		    }};
			
			this._fileDialog = new Panel( {
						definition : [
						              {
						                  type: "tree",
						                  data: "file",
						                  model: Resource,
						                  filters: filter
						                  
						                  
						                }						],
						data:{file:this.defaultFolder},
						style:"width:100%;height:100%;"
					});
		
			dojo.connect(this._fileDialog, "onChange", this, function(){ 
				debugger;
					this.value = this._fileDialog.attr('value'); 
					this._onChange();
				}, true);
			
			dojo.connect(this._fileDialog, "onSelect", this, function(){ 
				debugger;
					this.value = this._fileDialog.attr('value'); 
					this._onChange();
				}, true);
			dojo.connect(this._fileDialog, "onClick", this, function(){ 
				debugger;
					this.value = this._fileDialog.attr('value'); 
					this._onChange();
				}, true);
			this.domNode.appendChild(this._fileDialog.domNode);
		},
		_setBaseLocationAttr : function(baseLocation){
			// this is the directory to make everything relative to. also the first directory to show
		
			this._baseLocation = baseLocation;
			
		},
		_setValueAttr : function(value){
			 if(this.value!= value ){
				this.value = value;
				dojo.attr(this._fileDialog, "value", value);
			 }
		},
		_onChange : function(){	
		},
		
		onChange : function(event){},
		
		_getValueAttr : function(){
			return this._fileDialog.attr('value');
			
		}
		
	});
});
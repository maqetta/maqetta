define(["dojo/_base/declare",
        "davinci/workbench/WidgetLite",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common",
        "davinci/ve/widgets/HTMLStringUtil"
        
       
],function(declare,   WidgetLite, ItemFileReadStore, veNLS,commonNLS){

	return declare("davinci.ve.widgets.Trblbox", [WidgetLite], {
		
			shorthand : null,
			values :  null,
			alias : null,
		
			buildRendering: function(){
				
				this.domNode =   dojo.doc.createElement("div");
				
				if(this.values==null)
					this.values = ['', '0px', '1em']
				
				this.pageTemplate =   this.pageTemplate ||
									 [{display:"<b>(" + this.shorthand + ")</b>", type:"multi", target:this.shorthand,  values:this.values, alias:this.alias},
				                     {display:"show t/r/b/l", type:"boolean"},
				                     {display:"top", type:"multi", target:this.shorthand + "-top", values:this.values, alias:this.alias},
				                     {display:"right", type:"multi", target:this.shorthand +"-right", values:this.values, alias:this.alias},
				                     {display:"bottom", type:"multi", target:this.shorthand +"-bottom", values:this.values, alias:this.alias},
				                     {display:"left", type:"multi", target:this.shorthand +"-left", values:this.values, alias:this.alias}
	
				                     ],
	
				this.domNode.innerHTML =  davinci.ve.widgets.HTMLStringUtil.generateTable(this.pageTemplate);
				this.inherited(arguments);
			},
			
			startup : function(){
				var box = dojo.byId(this.pageTemplate[1]['id']);
			
				this.pageTemplate[1]['domNode'] = box;
				dojo.connect(box, "onclick", this, function(){this._onChange({target:1})});	
				
				this._toggleControls(false);
				this.inherited(arguments);
				for(var i = 0;i<this.pageTemplate.length;i++){
					var  id = this.pageTemplate[i]['id'];
					var widget = dijit.byId(id);
						
					if(widget){
						this.pageTemplate[i]['widget'] = widget;	
					}else{
						widget = dojo.byId(id);
						if(widget)
							this.pageTemplate[i]['domNode'] = widget;
					}
				}
				
			},
			
			_setReadOnlyAttr: function(isReadOnly){
				
				for(var i = 0;i<this.pageTemplate.length;i++){
					var widget = this.pageTemplate[i]['widget'];
					if(widget)
						widget.attr("readOnly", isReadOnly);
					else{
						var node = this.pageTemplate[i].domNode;
						if(node)
							dojo.attr(node, "disabled", isReadOnly);
					}
				}
			},
			
			getFieldValue : function(index){
				
				var box = this.pageTemplate[index]['widget'];
				var value = null;
				if(box){
					value = box.attr('value');
				}else{
					box = this.pageTemplate[index]['domNode'];
					value = dojo.attr(box,'value');	
				}
				return value;
			},
			
			setFieldValue : function(index,value){
				
				if(this.pageTemplate[index]['value']==value)
					return;
				
				var box = this.pageTemplate[index]['widget'];
				
				if(box){
					box.attr('value',value,true);
				}else{
					box = this.pageTemplate[index]['domNode'];
					dojo.attr(box,'value',value);	
				}
				this.pageTemplate[index]['value']=value;
			},
			
			
			
			_onChange : function(event){
				
				var index = event.target;
				var valueObject = {};
				if(index==1){	
					var showControls  =  dojo.attr(this.pageTemplate[index].domNode,'checked');
					this._toggleControls(showControls);
					return;
								
				}
			},
			_toggleControls : function(shouldShow){
				
				for(var i = 2;i<=5;i++ ){
					var box = dojo.byId(this.pageTemplate[i]['id']);
					box = box.parentNode.parentNode;
					if(shouldShow)
						dojo.removeClass(box,'dijitHidden');
					else
						dojo.addClass(box,'dijitHidden');
				}
			}
				
			
	});
});
dojo.provide("davinci.ve.utils.CssShortHand");





dojo.declare("davinci.ve.utils.CssShortHand",null,{
	
	/*
	 * looking for map such as:
	 * 
 							 'border' : ['border-width', 'border-style','border-color'],
							 'border-width'  : ['border-top-width','border-right-width','border-bottom-width','border-left-width'],
							 'border-style'  : ['border-top-style','border-right-style','border-bottom-style','border-left-style'],
							 'border-color'  : ['border-top-color','border-right-color','border-bottom-color','border-left-color'],
							 'border-bottom' : ['border-bottom-width', 'border-bottom-style','border-bottom-color'],
							 'border-top' 	 : ['border-bottom-width', 'border-bottom-style','border-bottom-color'],
							 'border-left'   : ['border-left-width', 'border-left-style','border-left-color'],
							 'border-right'  : ['border-right-width', 'border-right-style','border-right-color']
							};
	 */
	
	constructor : function(map){
	    this._map = map;
	    this._properties = {};
	},	
	
	setProperties : function(properties){
		this._properties = properties || {};
		this._expanded = null;
	},
	
	setProperty : function(prop,value){
		this._properties[prop] = value;
		this._expanded = null;
		
	},
	_getShortHand : function(name){
		
		var value = "";
		var map = this._map[name];
		var values = [];
		for(var i = 0;i<map.length;i++){
			var a = this.getProperty(map[i]);
			values.push(a);
		}
		if(values[1]==values[3])
			delete values[3];
		
		if(values[0]==values[2])
			delete values[2];
		
		if(values[0]==values[1])
			delete values[1];
		
		
		for(var i =0;i<values.length;i++){
			if(i!=0 && values[i])
				value+=" ";
			if(values[i])
				value += values[i];
		}
		return value;
		
	},
	
	_isBoxModel : function(name){
		
		return (name in this._map && this._map[name].length==4);
	},
	
	getProperty : function(name){
	
		if(this._properties[name] && !(name in this._map)){
			return this._properties[name];
		}
		
		if(!this._expanded)
			this._expanded = this._expandAll();
		
		
		if(this._expanded[name]){
			return this._expanded[name];
		}
		if(name in this._map){
			if(this._isBoxModel(name))
				return this._getShortHand(name);
			
			var value = "";
			var map = this._map[name];
			for(var i = 0;i<map.length;i++){
				var a = this.getProperty(map[i]);
				if(a && i>0)
					value+=" " + a;
				else if(a)
					value+=a;
			}
			return value
				
		}else{
			return undefined;
		}
	},
	
	_getVisitor : function(){
		var a = this;
		return {
					allValues : [],
					visit : function(node){
						if(node.elementType=='CSSProperty' && node.expanded.length>0){
							for(var i = 0;i<node.expanded.length;i++){
								var a = this.getValues(node.expanded[i]);
								dojo.mixin(this.allValues,a);
							}
						}else if(node.elementType=='CSSProperty'){
							var a = this.getValues(node);
							dojo.mixin(this.allValues,a);
						}
							
							
						return false;
					},
					
					getValues : function(p){
						var all = [];
						if(p.name in a._map){
							var map = a._map[p.name];
							var valueSplit = [];
							var shortHandValue = null;
							if(p.lengthValues.length>0){
								for(var i = 0;i<p.lengthValues.length;i++){
									valueSplit.push(p.lengthValues[i].length + p.lengthValues[i].units);
								}
								/* hack for the rgb(..) in color */
							}else if(a._isBoxModel(p.name) && !p.rgbValue){
								valueSplit = p.value.split(' ');
							}else if(p.rgbValue){
								valueSplit = [p.rgbValue];
							}else{
								valueSplit = [p.value];
							}
							if(map.length==4){
								switch(valueSplit.length){
								/* top right bottom left */
								case 1:
									all[map[0]] = valueSplit[0];
									all[map[1]] = valueSplit[0];
									all[map[2]] = valueSplit[0];
									all[map[3]] = valueSplit[0];

									break;
								case 2:
									all[map[0]] = valueSplit[0];
									all[map[1]] = valueSplit[1];
									all[map[2]] = valueSplit[0];
									all[map[3]] = valueSplit[1];

									break;
								case 3:
									all[map[0]] = valueSplit[0];
									all[map[1]] = valueSplit[1];
									all[map[2]] = valueSplit[2];
									all[map[3]] = valueSplit[1];
									break;
								case 4:
									all[map[0]] = valueSplit[0];
									all[map[1]] = valueSplit[1];
									all[map[2]] = valueSplit[2];
									all[map[3]] = valueSplit[3];
									break;
								
								}
							}
						}else{
							all[p.name] = p.value;
						}
						return all;
					}
				};
	},
	_expandAll : function(){
		var all = {};
		
		for(var name in this._properties){
			var a = {};
			if(name in this._map){
				a = this.getExpanded(name);				
			}else{
				a[name] = this._properties[name];
			}
			dojo.mixin(all,a);
		}
		return all;
		
	},
	_inMap : function(propName){
		
		if(propName in this._map)
			return true;
		
		for(var name in this._map){
			var map = this._map[name];
			for(var i = 0;i<map.length;i++){
				if(map[i]==propName)
					return true;
			}
		}
		return false;
		
	},
	getExpandedNoShorthand : function(){
		
		if(!this._expanded){
			
			this._expanded = this._expandAll();
		}
		var allValues = {};
		for(var name in this._expanded){
			
			if(!(name in this._map)) {
				if(this._inMap(name))
					allValues[name] = this._expanded[name];
			}
			
		}
		return allValues;
		
		
	},
	getExpanded : function(name){	
		/* expands shorthand values */
		var cssModel = new davinci.html.CSSFile({options:{xmode:'style', css:true, expandShorthand:true}});
		
		var cssText = ".fourtySixAndTwo{"; 
		cssText+=name + ":" + this._properties[name] + ";";
		
		cssText+="}";
		cssModel.setText(cssText);
		
		var visitor = this._getVisitor();
		cssModel.children[0].visit(visitor);
		return visitor.allValues;
	}
	
	
	
});

davinci.ve.utils.CssShortHand.map = {
		 'border' : ['border-width', 'border-style','border-color', 'border-top', 'border-left', 'border-right', 'border-bottom'],
		 'border-width'  : ['border-top-width','border-right-width','border-bottom-width','border-left-width'],
		 'border-style'  : ['border-top-style','border-right-style','border-bottom-style','border-left-style'],
		 'border-color'  : ['border-top-color','border-right-color','border-bottom-color','border-left-color'],
		 'border-bottom' : ['border-bottom-width', 'border-bottom-style','border-bottom-color'],
		 'border-top' 	 : ['border-top-width', 'border-top-style','border-top-color'],
		 'border-left'   : ['border-left-width', 'border-left-style','border-left-color'],
		 'border-right'  : ['border-right-width', 'border-right-style','border-right-color'],
		 'font'  : ['font-size', 'line-height','font-weight','font-style','font-family'],
		 'border-radius'  : ['border-top-left-radius', 'border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius'],
		 '-moz-border-radius'  : ['-moz-border-radius-topleft', '-moz-border-radius-topright','-moz-border-radius-bottomright','-moz-border-radius-bottomleft']
};
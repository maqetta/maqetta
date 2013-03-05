define(["dojo/_base/declare", "../../utils/pseudoClass"], function(declare, pseudoClass) {

//TODO: Create custom HTML metadata provider similar to CSS

return declare("davinci.ve.themeEditor.metadata.CSSThemeProvider", null, {

	module: "davinci.lib",
	path: "theme/tundra.json", 
	
	constructor: function(resources, theme){
		this._theme = theme;
		this.url = encodeURI(resources[0].getURL());
		this.getWidgets();
	},

	getWidgets: function(){
		if(!this._widgets){
			var style_obj = undefined;
			dojo.xhrGet({
				url: "" + this.url, //dojo.moduleUrl(this.module, this.path),
				handleAs: "json",
				sync: true,
				load: function(result){style_obj = result;}
			});
			this._widgets = style_obj;
			this._createDefaults();
			
		}
		return this._widgets;
	},
	
	_createDefaults: function(){
		var ret = true;
		for (var a in this._widgets){
			var toolkit = this._widgets[a];
			for (var b in toolkit){
				var widget = toolkit[b];
				for (var c in widget.states){
					var state = widget.states[c];
					var selector = this.getStyleSelectors(a+'.'+b, c); // this will create the default selctors if missing
				}
				for (var sw in widget.subwidgets){
					var subwidget = widget.subwidgets[sw];
					for (var c in subwidget.states){
						var state = subwidget.states[c];
						var selector = this.getStyleSelectors(a+'.'+b, c, sw); // this will create the default selctors if missing
					}
				}
			}
		}
		return;
	
	},
	
	getRelativeStyleSelectorsText: function(widgetType, state, subwidget,properties, className){
		var selectors = this.getStyleSelectors(widgetType, state,subwidget);
		var relativeSelectors = [];
		for (s in selectors){
			properties.forEach(function(property){
				var foundProp = false;
				for(var p=0;!foundProp && p<selectors[s].length;p++){
					if(selectors[s][p]==property || selectors[s][p] == '$std_10')
						foundProp=true;
					
				}
				if(foundProp){
					var text = "" + s;
					var classes = text.split(" ");
					text = "";
					classes.forEach(function(c){
						// remove the theme body class ex .claro
						if (c != "."+className) {
							text += " " + c;
						}
					}.bind(this));
					relativeSelectors.push(text.replace(/^\s*/, "").replace(/\s*$/, "")); // trim leading trailing white space
					return;
				}
			}.bind(this));
			
		}
		return relativeSelectors;
		
	},
	
	getStyleSelectors: function(widgetType, state, subwidget){
		//debugger;
		if(!widgetType){
			console.log('metadata:getStyleSelectors no widgetType');
			return;
		}
		if(!state) {
			state = 'Normal';
		}
		var selectors;
		var p = widgetType.split(/[\.\/]/);
		var w = p[0];
		var n = p[p.length-1];
		if(subwidget && (w in this._widgets) && (n in this._widgets[w])){
			var sw = (subwidget.id) ? subwidget.id : subwidget;
			if (!this._widgets[w][n].subwidgets[''+sw].states[''+state]) {
				return null; // not valid state
			}
			selectors = this._widgets[w][n].subwidgets[''+sw].states[''+state].selectors;
			if (!selectors || selectors == '$auto'){
				selectors = this._createDefaultSelectors(''+w+sw,state);
				this._widgets[w][n].subwidgets[''+sw].states[''+state].selectors = selectors;
			}
		}else if( this._widgets && (w in this._widgets) && (n in this._widgets[w])) {
			if (this._widgets[w][n].states[''+state]){ // does widget support this state?
				selectors = this._widgets[w][n].states[''+state].selectors;
				if (!selectors || selectors == '$auto'){
					selectors = this._createDefaultSelectors(''+w+n,state);
					this._widgets[w][n].states[''+state].selectors = selectors;
				}
			}
			
		}else{
			//console.log("metadata:getStyleSelectors metadata not found for " + widgetType + " state: " + state + " subwidget " + subwidget);
		}
		return selectors;
	},
	
	getElementStyleProperties: function (widgetType, state, subwidget){
		if(!widgetType){
			console.log('metadata:getElementStyleProperties no widgetType');
			return;
		}
		if(!state) {
			state = 'Normal';
		}
		var elementProps;
		var p = widgetType.split(/[\.\/]/);
		var w = p[0];
		var n = p[p.length-1];
		if(subwidget && (w in this._widgets) && (n in this._widgets[w])){
			var sw = (subwidget.id) ? subwidget.id : subwidget;
			if (!(this._widgets[w][n].subwidgets[''+sw].states[''+state]) || !(this._widgets[w][n].subwidgets[''+sw].states[''+state].element) || !(this._widgets[w][n].subwidgets[''+sw].states[''+state].element.style)) return null; // not valid 
			elementProps = this._widgets[w][n].subwidgets[''+sw].states[''+state].element.style;
//			if (!elementProps /*|| elementProps == '$auto'*/){
//				//elementProps = this._createDefaultElementProps(''+w+sw,state);
//				this._widgets[w][n].subwidgets[''+sw].states[''+state].selectors = selectors;
//			}
		}else if( this._widgets && (w in this._widgets) && (n in this._widgets[w])) {
			if (this._widgets[w][n].states[''+state] && this._widgets[w][n].states[''+state].element && this._widgets[w][n].states[''+state].element.style){ // does widget support this state?
				elementProps = this._widgets[w][n].states[''+state].element.style;
//				if (!selectors || selectors == '$auto'){
//					selectors = this._createDefaultSelectors(''+w+n,state);
//					this._widgets[w][n].states[''+state].selectors = selectors;
//				}
			}
			
		}else{
			console.log("metadata not found for" + widgetType + " state: " + state + " subwidget " + subwidget);
		}
		return elementProps;
	},
	_createDefaultSelectors: function(widgetName, state){
		var selector;
		if (state == 'Normal'){
			selector = '.'+this._theme.className+' .' + widgetName;
		} else {
			selector = '.'+this._theme.className+' .' + widgetName + state;
		}
		var selectors = {};
		selectors[selector] =  ["$std_10"];
	   return selectors;		
	},
	
	_createDefaultQuery: function(widgetName, state){
		return '.' + widgetName;
	},
	 
    _simulateState: function(q, s, mode, updateWidget){
        var querys = (q instanceof Array) ? q : [q];
        var simulates = (s instanceof Array) ? s : [s];

        for (var i = 0; i < simulates.length; i++){
            var simulate = simulates[i];
            var query = querys[i];
            var index;
            var attribute;
            var attributeValue;
            if ((index = simulate.indexOf(':')) > -1){
                attribute = simulate.substring(index+1);
                simulate = simulate.substring(0, index);
                index = attribute.indexOf('=');
                if(index > -1){
                    attributeValue = attribute.substring(index+1);
                    attribute = attribute.substring(0, index);
                } else {
                    attributeValue =  attribute;
                }
            }
            var nodes = dojo.query(query,updateWidget.domNode);
            var n = nodes[0];
            if(!n){ // might already be at the top node.
                n = updateWidget.domNode;
            }
            try {
                if(mode == 'add'){
                    if(attribute){
                        n.setAttribute(attribute, attributeValue);
                    }
                    if(simulate){
                        dojo.addClass(n,simulate);
                    }
                } else { 
                    if(attribute){
                        n.removeAttribute(attribute);
                    }
                    if (simulate){
                        dojo.removeClass(n,simulate);
                    }
                }
           } catch(e){
        	   console.error('CSSThemeProvider._simulateState invalid simulate in metadata for ' + updateWidget.type + " " + q + ": "  + s);
           }
        }
	},
	
	_updateStyle: function(updateWidget, widgetType, state, mode){
		if (updateWidget.id === 'all') return; // global all widget 
		var init = false;
		if(!state) {
			state = 'Normal';
			init = true;
		}
		if(!this._widgets){
			return null;
		}
		if (!widgetType){
			widgetType = updateWidget.type;
		}
//		if (widgetType == 'davinci.ve.widget.HtmlWidget' || widgetType == 'davinci.ve.helpers.HtmlWidget') {
//			 widgetType = 'html.' + node.localName;
//		 }
		var p = widgetType.split(/[\.\/]/);
		var w = p[0];
		var n = p[p.length-1];
//		var query;
//		var simulate;
		var widget = this._widgets[w][n];
		// some widgets do not start in a normal state. like TabContainer
		if (state === 'Normal' && init == true && mode === 'remove' && this._widgets[w][n].startState){
			state = this._widgets[w][n].startState;
		} 
		if (this._widgets[w][n].states[''+state]){
			var q = this._widgets[w][n].states[''+state].query;
			if (!q || q == '$auto'){
				q = this._createDefaultQuery(w+n, state);
				widget.states[''+state].query = q;
			}

			var s = this._widgets[w][n].states[''+state].simulate;
			if(!s){
				s = ' ';
				var selectors = this.getStyleSelectors(widgetType, state);
				var cssClass = '';
				for (var selector in selectors){
					cssClass = pseudoClass.replace(selector);
					cssClass  = cssClass.replace(/\./g,' ');
					cssClass = cssClass.replace(this._theme.className,'');
					s += ' ' + cssClass;
				}
				if(state != 'Normal'){
						s = w + state + ' ' + s; // add the default state class
				}
			}
			if (state != 'Normal'){ // Normal is the base class do not remove it.
				s += ' ' + pseudoClass.MAQETTA_PSEUDO_CLASS + state; // add the browser Pseudo Class emeulation
			    this._simulateState(q, s, mode, updateWidget);
			}
		}

		for(var sub in widget.subwidgets){
			var subwidget = widget.subwidgets[sub];
			// some widgets do not start in a normal state. like TabContainer
			if (state === 'Normal' && init == true && mode === 'remove' && subwidget.startState){
				state = subwidget.startState;
			} 
			if (subwidget.states[''+state]){ // only add if subwidget has this state
				var q = subwidget.states[''+state].query;
				var s = subwidget.states[''+state].simulate;
				if (!q || q == '$auto'){
					q = this._createDefaultQuery(w+sub, state);
					subwidget.states[''+state].query = q;
				}
				if(!s){
					var selectors = this.getStyleSelectors(widgetType, state, sub);
					var cssClass = '';
					s = ' ';
					for (var selector in selectors){
						cssClass = pseudoClass.replace(selector)
							.replace(/\./g,' ')
							.replace(this._theme.className,'');
						s += ' ' + cssClass;
					}
					if(state != 'Normal'){
							s = w + state + ' ' + s; // add the default state class
						}
				}
				if (state != 'Normal'){ // Normal is the base class do not remove it.
	                this._simulateState(q, s, mode, updateWidget);
	            }
				/*query = q; //push(q);
				simulate = s; //.push(s);
				var nodes = dojo.query(query,updateWidget.domNode);
				var n = nodes[0];
				if(!n){ // might already be at the top node.
					n = updateWidget.domNode;
				}
				if (state != 'Normal'){ // Normal is the base class do not remove it.
					if(mode == 'add'){
						dojo.addClass(n,simulate);
					} else { 
						dojo.removeClass(n,simulate);
					}
				}*/
				
			}
		}

		return;
	},
	
	setStyleValues: function(node, widgetType, state, subwidget){
		this._updateStyle(node, widgetType, state, 'add');
	},
	removeStyleValues: function(node, widgetType, state, subwidget){
		if(state && state != 'Normal'){
			this._updateStyle(node, widgetType, state, 'remove');
		}
		
	}, 
	
	setWidgetStyleValues: function(node, state){
		var widget = davinci.ve.widget.getWidget(node);
		this._updateStyle(node, null, state, 'add');
	},
	removeWidgetStyleValues: function(node, state){
		//if(state && state != 'Normal'){
			this._updateStyle(node, null, state, 'remove');
		//}
		
	}, 
	
	getDomNode: function (node, widgetType, subwidget, state){
		if(!this._widgets){
				return null;
		}
		if(!state){
			state = 'Normal';
		}
			
		var p = widgetType.split(/[\.\/]/);
		var w = p[0];
		var n = p[p.length-1];
		var query;
		try {
			if (subwidget){
				query = this._widgets[w][n].subwidgets[''+subwidget].states[''+state].query;
				if (!query || query == '$auto'){
					query = this._createDefaultQuery(w+subwidget, state);
					this._widgets[w][n].subwidgets[''+subwidget].states[''+state].query = query;
				}
			}else{
				query = this._widgets[w][n].states[''+state].query;
				if (!query || query == '$auto'){
					query = this._createDefaultQuery(w+n, state);
					this._widgets[w][n].states[''+state].query = query;
				}
			}
		} catch (e) {
			console.log(e, 'w=' + w, 'n=' + n);
			return null;
		}
		var q;
		if (query instanceof Array){ 
			// Array so just use the first element for domNode query
			q = query[0];
		} else {
			q = query;
		}
		
		var nodes = dojo.query(q,node);
		var n = nodes[0];
		if(!n){ // might already be at the top node.
			n = node;
		}
		return n;
		
	},
	
	getMetadata: function(widgetType){
		if (!widgetType) {
			return undefined;
		}
		var p = widgetType.split(/[\.\/]/);
		var w = p[0];
		var n = p[p.length-1];
		var s = this._widgets && this._widgets[w] && this._widgets[w][n];
		return s;
	},
	
	getWidgetType: function(widget){
		var widgetType;
		widgetType = widget.type;

//		if (widgetType == 'davinci.ve.widget.HtmlWidget' || widgetType == 'davinci.ve.helpers.HtmlWidget') {
//			 widgetType = 'html.' + node.localName;
//		 }
		var id = widget.id;
		if(id.indexOf('all') === 0){ // this is a  mythical widget used for global change of widgets 
			widgetType = widgetType + '.$' + id; // add this to the end so it will match the key in the metadata
		}
		return widgetType;
	},
	
	
	isPropertyVaildForWidgetRule : function(rule, property, widget, subWidget, state){

		var widgetType = this.getWidgetType(widget);
		var widgetMetaData = this.getMetadata(widgetType);
		if (subWidget) {
			widgetMetaData = widgetMetaData.subwidgets[subWidget];
		}
		if (state) {
			widgetMetaData = widgetMetaData.states[state];
		} else {
			widgetMetaData = widgetMetaData.states['Normal'];
		}
		var selectorText = rule.getSelectorText();
		for (var selector in widgetMetaData.selectors){
			var props = widgetMetaData.selectors[selector];
			//if (containsSelector(rule, selector)){
			if (selectorText == selector){ // match the complete selector
				//console.log('found the selector ' + selectorText);
				for (var i=0; i < props.length; i++){
					var prop = props[i];
					if (prop == '$std_10' || prop == property){
						//console.log('Valid: ' + property + ' for CSSRule ' + selectorText);
						return true;
					}
				}
			}
		}
		//return this.isPropertyRuleValid(rule, property, widgetMetaData);
		return false;
	},
	
	isPropertyRuleValid: function(rule, property, widgetMetaData){
		var selectorText = rule.getSelectorText();
		for (var c in widgetMetaData.states){
			var state = widgetMetaData.states[c];
			for (var selector in state.selectors){
				var props = state.selectors[selector];
				//if (containsSelector(rule, selector)){
				if (selectorText == selector){ // match the complete selector
					//console.log('found the selector ' + selectorText);
					for (var i=0; i < props.length; i++){
						var prop = props[i];
						if (prop == '$std_10' || prop == property){
							//console.log('Valid: ' + property + ' for CSSRule ' + selectorText);
							return true;
						}
					}
				}
			}
		}
		for (var sw in widgetMetaData.subwidgets){
			var subwidget = widgetMetaData.subwidgets[sw];
			for (var c in subwidget.states){
				var state = subwidget.states[c];
				for (var selector in state.selectors){
					var props = state.selectors[selector];
					//if (containsSelector(rule, selector)){
					if (selectorText == selector){ // match the complete selector
						//console.log('found the selector ' + selectorText); 
						for (var i=0; i < props.length; i++){
							var prop = props[i];
							if (prop == '$std_10' || prop == property){
								//console.log('Valid: ' + property + ' for CSSRule ' + selectorText);
								return true;
							}
						}
					}
				}
			}
		}
        return false;
		
		function containsSelector(rule, selectorText){
			for (var i=0;i<rule.selectors.length; i++)
			{
				var selectorName = rule.selectors[i].getText();
				if (selectorName == selectorText)
					return true;
			}
			return false;
		}
		
	},
	
		
	isPropertyValidForRule: function(rule, property){
		var ret = false;
		var selectorText = rule.getSelectorText();
		for (var a in this._widgets){
			var toolkit = this._widgets[a];
			for (var b in toolkit){
				var widget = toolkit[b];
				if(this.isPropertyRuleValid(rule, property, widget)){
					return true;
				}
			}
		}
		console.log('Invalid: ' + property + ' for CSSRule ' + selectorText);
		return ret;
		
	},
	
	getStatesForAllWidgets: function(){
		if (!this._widgets){
			return null;
		}
		states = [];
		for (var a in this._widgets){
			var toolkit = this._widgets[a];
			for (var b in toolkit){
 			  if (b.indexOf('$all') != 0){ // don't inclue the states for the all widgets
				var widget = toolkit[b];
				for (var c in widget.states){
					states[c] = c;
				}
				for (var sw in widget.subwidgets){
					var subwidget = widget.subwidgets[sw];
					for (var c in subwidget.states){
						states[c] = c;
					}
				}
 			  }
			}
		 }
		retStates = [];
		for (var s in states){
			retStates.push(s);
		}
		return retStates.sort();
	},
	
	isStateValid: function(widget, state, subW){
		if (!this._widgets){
			return false;
		}
		if (widget.id === 'all' && state != 'Normal'){
			return false;
		}
		var widgetType = widget.type;
		var widgetMetaData = this.getMetadata(widgetType);
		if (widgetMetaData.states[state] && !subW){
			// it has the state
			return true;
		}
		if (!subW){
			for (var sw in widgetMetaData.subwidgets){
				var subwidget = widgetMetaData.subwidgets[sw];
				if(subwidget.states[state]){
					return true;
				}
			}
		} else {
			var subwidget = widgetMetaData.subwidgets[subW];
			if(subwidget && subwidget.states[state]){
				return true;
			}
		}
		return false;
	}
});

});

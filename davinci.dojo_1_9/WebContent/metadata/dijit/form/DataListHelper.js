define(function() {

var DataListHelper = function() {};
DataListHelper.prototype = {

		getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
			if(!widget){
				return undefined;
			}
			
			var children = [];
			
			if(widget.dijitWidget && widget.dijitWidget.data){
				var store = widget.dijitWidget.data;
				for (var i=0; i < store.length; i++){
						var name = store[i].name; 
						var value = store[i].value; 
						children.push({type: "html.option", properties: {value: value}, children: name});
						
					}
			}else{
				if(widget.domNode.options){
					dojo.forEach(widget.domNode.options, function(o){
						var p = {value: o.value};
						var c = o.innerHTML;
						children.push({type: "html.option", properties: p, children: c});
					});
				}
			}
			return children;
		},
		
		getData: function(widget, options){
			var data = widget._getData(options);
			data.properties['data-dojo-props'] =  'id: "' + widget.id+'"';
			data.properties.dojotype = "dijit.form.DataList";
			return data;
		},
		
		getChildren: function(widget, options){
			var children = [];
			return children;
		},
		
		startup: function(widget, options){
		},
		
		create: function(widget, srcElement){
			// FIXME #3652 I believe this method is no longer needed after adding
			// the postCreateWidget helper. But it is late in M8 testing and I am 
			// leaving it for safety... 
			this.postCreateWidget(widget);
		},
		
		postCreateWidget: function(widget){
			if (widget.dijitWidget){
				widget.dijitWidget.getChildren = this.getChildren;
				widget.dijitWidget.startup = this.startup;
			}
			
			widget.domNode.style.display = 'none';
		},
		
		destroy: function(widget){
			var localDijit = widget.getContext().getDijit();

			var w= localDijit.byId(widget.id); 
			w.destroy();
		}

};

return DataListHelper;

});
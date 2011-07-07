[{

	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		if(options && options.serialize &&
			widget.object == widget.id && widget.method){
			var method = widget[widget.method];
			if(method){
				method = method.toString();
				var begin = method.indexOf('{');
				var end = method.lastIndexOf('}');
				var text = method.substring(begin + 1, end);
				var script = {type: "html.script",
					properties: {type: "dojo/method", event: widget.method},
					children: text};
				return [script];
			}
		}

		return davinci.ve.widget._getChildrenData(widget, options); 
	}

}]

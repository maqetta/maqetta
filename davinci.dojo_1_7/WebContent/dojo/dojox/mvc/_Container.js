define(["dijit/_WidgetBase"], function(_WidgetBase){
	return dojo.declare("dojox.mvc._Container", [dijit._WidgetBase], {
	
		// stopParser: [private] Boolean
		//		Flag to parser to not try and parse widgets declared inside the container.
		stopParser: true,
	
		// templateString: [private] String
		//		The template or content for this container. It is usually obtained from the
		//		body of the container and may be modified or repeated over a collection/array.
		//		In this simple implementation, attach points, attach events and WAI
		//		attributes are not supported in the template.
		templateString : "",
	
		// _containedWidgets: [protected] dijit._Widget[]
		//		The array of contained widgets at any given point in time within this container.
		_containedWidgets : [],
	
		////////////////////// PROTECTED METHODS ////////////////////////
	
		_createBody: function(){
			// summary:
			//		Parse the body of this MVC container widget.
			// description:
			//		The bodies of MVC containers may be model-bound views generated dynamically.
			//		Parse the body, start an contained widgets and attach template nodes for
			//		contained widgets as necessary.
			// tags:
			//		protected
			this._containedWidgets = dojo.parser.parse(this.srcNodeRef,{
				template: true,
				inherited: {dir: this.dir, lang: this.lang},
				propsThis: this,
				scope: "dojo"
			});
		},
	
		_destroyBody: function(){
			// summary:
			//		Destroy the body of this MVC container widget. Also destroys any
			//		contained widgets.
			// tags:
			//		protected
			if(this._containedWidgets && this._containedWidgets.length > 0){
				for(var n = this._containedWidgets.length - 1; n > -1; n--){
					var w = this._containedWidgets[n];
					if(w && !w._destroyed && w.destroy){
						w.destroy();
					}
				}
			}
		},
	
		////////////////////// PRIVATE METHODS ////////////////////////
	
		_exprRepl: function(tmpl){
			// summary:
			//		Does substitution of ${foo+bar} type expressions in template string.
			// tags:
			//		private
			var pThis = this, transform = function(value, key){
				if(!value){return "";}
				var exp = value.substr(2);
				exp = exp.substr(0, exp.length - 1);
				return eval(exp, pThis);
			};
			transform = dojo.hitch(this, transform);
			return tmpl.replace(/\$\{.*?\}/g,
				function(match, key, format){
					return transform(match, key).toString();
				});
		}
	});
});

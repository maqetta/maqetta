define([
	'dojo/_base/declare',
	'dojo/_base/connect',
	'dojo/_base/array'
], function(declare, connect, array){

	return declare([], {
		// summary:
		//		Abstract base class for all model components (including cache)
		constructor: function(model){
			var t = this, c = 'connect', i = t.inner = model._model;
			t._cnnts = [];
			t.model = model;
			model._model = t;
			if(i){
				t[c](i, 'onDelete', '_onDelete');
				t[c](i, 'onNew', '_onNew');
				t[c](i, 'onSet', '_onSet');
			}
		},

		destroy: function(){
			array.forEach(this._cnnts, connect.disconnect);
		},

		connect: function(obj, event, method, scope){
			var cnnt = connect.connect(obj, event, scope || this, method);
			this._cnnts.push(cnnt);
			return cnnt;
		},

		//Events----------------------------------------------------------------------
		//Make sure every extension has the oppotunity to decide when to fire an event at its level.
		_onNew: function(){
			this.onNew.apply(this, arguments);
		},

		_onSet: function(){
			this.onSet.apply(this, arguments);
		},

		_onDelete: function(){
			this.onDelete.apply(this, arguments);
		},

		onNew: function(){},
		onDelete: function(){},
		onSet: function(){},

		//Protected-----------------------------------------------------------------
		_call: function(method, args){
			var t = this, m = t[method], n = t.inner;
			return m ? m.apply(t, args || []) : n && n._call(method, args);
		},

		_mixinAPI: function(){
			var i, m = this.model, args = arguments,
				api = function(method){
					return function(){
						return m._model._call(method, arguments);
					};
				};
			for(i = args.length - 1; i >= 0; --i){
				m[args[i]] = api(args[i]);
			}
		}
	});
});

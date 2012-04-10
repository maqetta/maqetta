define([
	'dojo/_base/declare',
	'dojo/_base/array',
	'../_Extension'
], function(declare, array, _Extension){

	return declare(_Extension, {
		name: 'move',

		priority: 5,

		constructor: function(model){
			this.clear();
			this._mixinAPI('isMarked', 'getMarkedIds', 'markById', 'markByIndex', 'clearMark');
			model.onMarked = function(){};
			model.onMarkRemoved = function(){};
			this.connect(model, '_msg', '_receiveMsg');
			model._spTypes = {};
		},

		//Public------------------------------------------------------------------
		clear: function(){
			this._byId = {};
		},

		clearMark: function(type){
			this._byId[this._initMark(type)] = {};
		},

		getMarkedIds: function(type){
			var ret = [], id, ids = this._byId[this._initMark(type)];
			if(ids){
				for(id in ids){
					ret.push(id);
				}
			}
			return ret;
		},

		isMarked: function(id, type){
			return !!this._byId[this._initMark(type)][id];
		},

		markById: function(id, toMark, type){
			//Should we make this sync?
			this._cmd(id, toMark, type, 1);
		},

		markByIndex: function(index, toMark, type){
			//only support root items
			if(index >= 0 && index < Infinity){
				this._cmd(index, toMark, type);
			}
		},

		//Private----------------------------------------------------------------
		_mark: function(id, toMark, type){
			var t = this,
				tp = t._initMark(type),
				isMarked = t.isMarked(id, tp);
			if(toMark && !isMarked){
				t._addMark(id, tp);
			}else if(!toMark && isMarked){
				t._removeMark(id, tp);
			}
		},

		_cmdMark: function(){
			var t = this, args = arguments, ranges = [], m = t.model._model;
			array.forEach(args, function(arg){
				if(!arg[3]){
					ranges.push({
						start: arg[0],
						count: 1
					});
				}
			});
			return m._call('when', [{
				id: [],
				range: ranges
			}, function(){
				array.forEach(args, function(arg){
					if(!arg[3]){
						arg[0] = m._call('indexToId', [arg[0]]);
					}
					if(arg[0]){
						t._mark.apply(t, arg);
					}
				});
			}]);
		},

		_onDelete: function(id){
			var t = this, tp, c = t._byId;
			for(tp in c){
				delete c[t._initMark(tp)][id];
			}
			t.onDelete.apply(t, arguments);
		},

		_initMark: function(type){
			var c = this._byId, tp = type || 'select';
			c[tp] = c[tp] || {};
			return tp;
		},

		_addMark: function(id, type){
			var t = this, tp = t._initMark(type);
			t._byId[tp][id] = 1;
			t.model.onMarked(id, tp);
		},

		_removeMark: function(id, type){
			var t = this, tp = t._initMark(type);
			delete t._byId[tp][id];
			t.model.onMarkRemoved(id, tp);
		},

		_cmd: function(){
			this.model._addCmd({
				name: "_cmdMark",
				scope: this,
				args: arguments,
				async: 1
			});
		},

		_receiveMsg: function(msg, filteredIds){
			if(msg == 'filter'){
				var t = this, tp, sp = t.model._spTypes, id;
				for(tp in sp){
					if(sp[tp]){
						for(id in t._byId[tp]){
							if(!filteredIds[id]){
								t._removeMark(id, tp);
							}
						}
					}
				}
			}
		}
	});
});

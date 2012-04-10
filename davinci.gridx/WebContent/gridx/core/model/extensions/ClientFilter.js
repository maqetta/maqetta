define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	'../_Extension'
], function(declare, array, lang, Deferred, _Extension){

	var hitch = lang.hitch,
		forEach = array.forEach,
		indexOf = array.indexOf;

	return declare(_Extension, {
		// Not compatible with Map extension!
		name: 'clientFilter',

		priority: 20,

		constructor: function(model, args){
			this.pageSize = args.pageSize || 100;
			this._mixinAPI('filter', 'hasFilter');
			model.onFilterProgress = function(){};
			this.connect(model, '_msg', '_receiveMsg');
		},

		//Public---------------------------------------------------------------------

		//pageSize: 100,

		clear: function(){
			this._ids = 0;
			this._indexes = {};
		},

		filter: function(checker){
			this.model._addCmd({
				name: '_cmdFilter',
				scope: this,
				args: arguments,
				async: 1
			});
		},

		hasFilter: function(){
			return !!this._ids;
		},

		byIndex: function(index){
			var ids = this._ids,
				inner = this.inner,
				id = ids && ids[index];
			return ids ? id && inner._call('byId', [id]) : inner._call('byIndex', arguments);
		},

		byId: function(id){
			return (this.ids && this._indexes[id] === undefined) ? null : this.inner._call('byId', arguments);
		},

		indexToId: function(index){
			return this._ids ? this._ids[index] || undefined : this.inner._call('indexToId', arguments);
		},

		idToIndex: function(id){
			if(this._ids){
				var idx = indexOf(this._ids, id);
				return idx >= 0 ? idx : undefined;
			}
			return this.inner._call('idToIndex', arguments);
		},

		size: function(){
			return this._ids ? this._ids.length : this.inner._call('size', arguments);
		},

		when: function(args, callback){
			var t = this,
				f = function(){
					if(t._ids){
						t._mapWhenArgs(args);
					}
					return t.inner._call('when', [args, callback]);
				};
			if(t._refilter){
				t._refilter = 0;
				if(t._ids){
					var d = new Deferred;
					t._reFilter().then(function(){
						f().then(hitch(d, d.callback), hitch(d, d.errback));
					});
					return d;
				}
			}
			return f();
		},

		//Private---------------------------------------------------------------------
		_cmdFilter: function(){
			var a = arguments;
			return this._filter.apply(this, a[a.length - 1]);
		},

		_filter: function(checker){
			var t = this,
				oldSize = t.size();
			t.clear();
			if(lang.isFunction(checker)){
				var ids = [];
				return t.model.scan({
					start: 0,
					pageSize: t.pageSize,
					whenScope: t,
					whenFunc: t.when
				}, function(rows, s){
					var i, id, row, end = s + rows.length;
					for(i = s; i < end; ++i){
						id = t.indexToId(i);
						row = t.byIndex(i);
						if(row){
							if(checker(row, id)){
								ids.push(id);
								t._indexes[id] = i;
							}
						}else{
							break;
						}
					}
				}).then(function(){
					if(ids.length == t.size()){
						//Filtered item size equals cache size, so filter is useless.
						t.clear();
					}else{
						t._ids = ids;
						t.model._msg('filter', ids);
					}
				}, 0, t.model.onFilterProgress);
			}else{
				var d = new Deferred;
				d.callback();
				return d;
			}
		},

		_mapWhenArgs: function(args){
			//Map ids and index ranges to what the store needs.
			var t = this, ranges = [], size = t._ids.length;
			args.id = array.filter(args.id, function(id){
				return t._indexes[id] !== undefined;
			});
			forEach(args.range, function(r){
				if(!r.count || r.count < 0){
					//For open ranges, must limit the size because we know the filtered size here.
					var cnt = size - r.start;
					if(cnt <= 0){
						return;
					}
					r.count = cnt;
				}
				for(var i = 0; i < r.count; ++i){
					var idx = t._mapIndex(i + r.start);
					if(idx !== undefined){
						ranges.push({
							start: idx,
							count: 1
						});
					}
				}
			});
			args.range = ranges;
		},

		_mapMoveArgs: function(args){
			var t = this;
			if(args.length == 3){
				var indexes = [];
				for(var i = args[0], end = args[0] + args[1]; i < end; ++i){
					indexes.push(t._mapIndex(i));
				}
				args[0] = indexes;
				args[1] = t._mapIndex(args[2]);
				args.pop();
			}else{
				args[0] = array.map(args[0], function(index){
					return t._mapIndex(index);
				});
				args[1] = t._mapIndex(args[1]);
			}
		},

		_mapIndex: function(index){
			return this._indexes[this._ids[index]];
		},

		_moveFiltered: function(start, count, target){
			var t = this, size = t._ids.length;
			if(start >= 0 && start < size && 
				count > 0 && count < Infinity && 
				target >= 0 && target < size && 
				(target < start || target > start + count)){

				var i, len, indexes = [];
				for(i = start, len = start + count; i < len; ++i){
					indexes.push(t._mapIndex(i));
				}
				t.inner._call('moveIndexes', [indexes, t._mapIndex(target)]);
			}
		},

		_reFilter: function(){
			var t = this;
			return t.inner._call('when', [{
				id: t._ids,
				range: []
			}, function(){
				forEach(t._ids, function(id){
					var idx = t.inner._call('idToIndex', [id]);
					t._indexes[id] = idx;
				});
				t._ids.sort(function(a, b){
					return t._indexes[a] - t._indexes[b];
				});
			}]);
		},

		_onMoved: function(map){
			var t = this;
			forEach(t._ids, function(id){
				var oldIdx = t._indexes[id];
				if(map[oldIdx] !== undefined){
					t._indexes[id] = map[oldIdx];
				}
			});
			t._ids.sort(function(a, b){
				return t._indexes[a] - t._indexes[b];
			});
		},

		_receiveMsg: function(msg, args){
			var t = this;
			if(t._ids){
				if(msg == 'storeChange'){
					t._refilter = 1;
				}else if(msg == 'moved'){
					t._onMoved(args);
				}else if(msg == 'beforeMove'){
					t._mapMoveArgs(args);
				}
			}
		},

		_onNew: function(id){
			var t = this;
			if(t._ids){
				t._ids.push(id);
				t._refilter = 1;
			}
			t.onNew.apply(t, arguments);
		},

		_onDelete: function(id, index, row){
			var t = this, indexes = t._indexes, ids = t._ids;
			if(ids){
				var i = indexOf(ids, id),
					idx = indexes[id];
				if(i >= 0){
					ids.splice(i, 1);
				}
				if(i >= 0 && idx !== undefined){
					index = i;
					for(i in indexes){
						if(indexes[i] > idx){
							--indexes[i];
						}
					}
				}else{
					index = undefined;
					t._refilter = 1;
				}
			}
			t.onDelete(id, index, row);
		}
	});
});

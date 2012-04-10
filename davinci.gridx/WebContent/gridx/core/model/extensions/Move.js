define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"dojo/DeferredList",
	'../_Extension'
], function(declare, lang, Deferred, DeferredList, _Extension){

	var hitch = lang.hitch;

	function getMoves(indexes, target){
		//Transform arbitrary index array to an array of standard moves: [start, count, target].
		var i, len, arr = [], moves = [], move, 
			beforeBegin = 1, afterBegin = 1,
			beforeTarget = target, afterTarget = target, pos;
		for(i = 0, len = indexes.length; i < len; ++i){
			arr[indexes[i]] = 1;
		}
		for(i = 0, len = arr.length; i < len; ++i){
			if(arr[i]){
				if(i < target){
					if(beforeBegin){
						beforeBegin = 0;
						move = [i, 1];
						pos = moves.length;
						moves.unshift(move);
					}else if(arr[i - 1]){
						++move[1];
					}
				}else{
					if(afterBegin){
						afterBegin = 0;
						move = [i, 1, afterTarget];
						moves.push(move);
						++afterTarget;
					}else if(arr[i - 1]){
						++move[1];
						++afterTarget;
					}
				}
			}else{
				beforeBegin = afterBegin = 1;
			}
		}
		for(i = 0; i <= pos; ++i){
			move = moves[i];
			move[2] = beforeTarget;
			beforeTarget -= move[1];
		}
		return moves;
	}

	function mapIndex(start, count, target, map){
		//Do the actual mapping index work.
		var mapping = {}, from, to, i, revMap = {};

		if(target > start + count){
			//target is after the range
			for(i = 0; i < count; ++i){
				mapping[start + i] = target + i - count;
			}
			for(i = 0; i < target - start - count; ++i){
				mapping[start + count + i] = start + i;
			}
		}else if(target < start){
			//target is before the range
			for(i = 0; i < count; ++i){
				mapping[start + i] = target + i;
			}
			for(i = 0; i < start - target; ++i){
				mapping[target + i] = target + i + count;
			}
		}else{
			//target is in the range
			return;
		}
		for(from in map){
			revMap[map[from]] = parseInt(from, 10);
		}
		for(from in mapping){
			to = mapping[from];
			if(revMap.hasOwnProperty(from)){
				from = revMap[from];
			}
			if(from == to){
				delete map[from];
			}else{
				map[from] = to;
			}
		}
	}
	return declare(_Extension, {
		// Not compatible with Sort and Map extensions!
		name: 'move',

		priority: 10,

		constructor: function(model, args){
			var t = this, options = model._cache.options = model._cache.options || {};
			t._mixinAPI('move', 'moveIndexes', 'insert');
			model.onMoved = function(){};
			//User can customize how to deal with moved rows by providing his own updateStore method.
			if(args.updateStore){
				t.updateStore = args.updateStore;
			}
			if(args.moveSortInfo){
				//User can customize the whole sort info.
				options.sort = args.moveSortInfo;
			}else{
				//Or just provide a field indicating the moving order (recommended)
				options.sort = [{
					attribute: t.moveField = args.moveField || 'order',
					descending: t.moveFieldDescending = args.moveFieldDescending || false
				}];
			}
		},

		//Public---------------------------------------------------------------------
		//moveField: 'order',

		//moveFieldDescending: false,

		//moveSortInfo: [],

		clear: function(){},

		move: function(start, count, target){
			// summary
			//		Move rows by row index.
			if(start >= 0 && start < Infinity && 
				count > 0 && count < Infinity && 
				target >= 0 && target < Infinity && 
				(target < start || target > start + count)){
				this.model._addCmd({
					name: '_cmdMove',
					scope: this,
					args: [start, count, target],
					async: 1
				});
			}
		},

		moveIndexes: function(indexes, target){
			this.model._addCmd({
				name: '_cmdMove',
				scope: this,
				args: [indexes, target],
				async: 1
			});
		},

		insert: function(dataArray, prevItem, nextItem){
			var finished = new Deferred,
				success = hitch(finished, finished.callback),
				fail = hitch(finished, finished.errback),
				moveField = this.moveField,
				store = this.model.store,
				i, data, dl = [],
				getValue = function(item){
					return store.fetch ? store.getValue(item, moveField) : item[moveField];
				},
				prevValue = prevItem ? getValue(prevItem) : null,
				nextValue = nextItem ? getValue(nextItem) : null;
			for(i = 0; data = dataArray[i]; ++i){
				if(prevValue === null && nextValue === null){
					//No data in grid
					prevValue = Math.random();
				}else if(prevValue === null){
					//Be first row in grid
					prevValue = nextValue - 1;
				}else if(nextValue === null){
					//Be last row in grid
					prevValue = prevValue + 1;
				}else{
					//Between 2 existing rows
					prevValue = (prevValue + nextValue) / 2;
				}
				data[moveField] = prevValue;
				if(store.fetch){
					store.newItem(data);
				}else{
					var d = new Deferred;
					Deferred.when(store.add(data), hitch(d, d.callback), hitch(d, d.errback));
					dl.push(d);
				}
			}
			if(store.fetch){
				store.save({
					onComplete: success,
					onError: fail
				});
			}else{
				new DeferredList(dl).then(success, fail);
			}
			return finished;
		},
		
		updateStore: function(finishDef, moves, map){
			// summary:
			//		Do the actual moving work here, that is to change the moveField of moved rows.
			//		User can overwrite this function to provide customized logic.
			//		Here a default implementation is provided. This implementation requires the
			//		moveField is a field of number type, and it can accept any number. In other words,
			//		this moveField is just a field to indicate row order without any other meanings.
			//		This default implementation tries to reduce the overall requests sent to store, 
			//		because the current store implementation sends a separate PUT command to store for every
			//		single item one by one.
			//
			//		Note: this is more like a public attribute rather than a public method, because users
			//		should assign a value to is rather can directly call it.
			//
			// finishDef: dojo.Deferred
			//		A Deferred object to indicate when the update is finished. finishDef.callback() or finishDef.errback()
			//		must be called in this function, otherwise the grid will break.
			// moves: Array
			//		This is an array of arrays. Each element is an array of 3 numbers: startIndex, rowCount, targetIndex.
			//		These numbers represents a single movement operation, which has the following semantic:
			//			"rowCount" rows from index "startIndex" are moved to index "targetIndex"
			//		These movement operations take place in the given order, so the index in later movement is different from
			//		those in the previous movement, since it is based on the result of the previous movement.
			// map: Association array
			//		An index mapping from the original indexes to the new indexes. This map is generated from the "moves" argument,
			//		so it has exactly the same information as "moves". But it is pre-processed to reflect the final index mapping
			//		after all these movements are done, so it might be easier to use.
			console.log(moves, map);
			var reverseIndexes = [], info = [], indexes = [], ranges = [],
				from, to, m = {}, i, dif, cat = {}, mostDif, maxCount = 0, t = this, 
				inner = t.inner, store = t.model.store, moveField = t.moveField, dl = [],

				findBefore = function(to){
					if(to > 0){
						return reverseIndexes[to - 1] === undefined ? to - 1 : reverseIndexes[to - 1];
					}else{
						return -1;
					}
				},
				findAfter = function(to){
					for(; to < reverseIndexes.length; ++to){
						var from = reverseIndexes[to];
						if(!info[from]){
							return from === undefined ? to : from;
						}
					}
					return to;
				},
				getItem = function(index){
					var row = inner._call('byIndex', [index]);
					return row && row.item;
				},
				getValue = function(item){
					return store.fetch ? store.getValue(item, moveField) : item[moveField];
				},
				calcValue = function(index, size){
					var context = info[index];
					if(context){
						return context.value;
					}else if(index < 0){
						return getValue(getItem(0)) - 1;
					}else if(index < size){
						return getValue(getItem(index));
					}else{
						return getValue(getItem(size - 1)) + 1;
					}
				},
				setValue = function(item, value){
					if(store.fetch){
						store.setValue(item, moveField, value);
					}else{
						item = lang.clone(item);
						item[moveField] = value;
//                        console.log('setValue:', item, moveField, value);
						var d = new Deferred;
						Deferred.when(store.put(item, {
							overwrite: true
						}), hitch(d, d.callback));
						dl.push(d);
					}
				},
				saveStore = function(){
					if(store.fetch){
						store.save({
							onComplete: function(){
								finishDef.callback();
							},
							onError: function(e){
								finishDef.errback(e);
							}
						});
					}else{
						(new DeferredList(dl)).then(function(){
							finishDef.callback();
						}, function(e){
							finishDef.errback(e);
						});
					}
				};

			var first = Infinity;
			for(from in map){
				from = parseInt(from, 10);
				to = map[from];
				m[from] = to;
				if(to < first){
					first = to;
				}
				reverseIndexes[to] = from;
			}
			for(i = first; i < reverseIndexes.length; ++i){
				if(reverseIndexes[i] === undefined){
					reverseIndexes[i] = i;
					m[i] = i;
				}
			}
			//Categorize mappings
			for(from in m){
				from = parseInt(from, 10);
				to = m[from];
				dif = to - from;
				if(cat[dif] === undefined){
					cat[dif] = 1;
				}else{
					++cat[dif];
				}
			}
			//Find the category with most rows
			for(dif in cat){
				if(cat[dif] > maxCount){
					maxCount = cat[dif];
					mostDif = dif;
				}
			}
			//Find out the rows that need to update (all the rows not belong to the biggest category)
			for(to = 0; to < reverseIndexes.length; ++to){
				from = reverseIndexes[to];
				if(from !== undefined && to - from != mostDif){
					info[from] = {};
					indexes.push(from);
				}
			}
			//For every row to change, find it's previous and next row in the final order.
			for(i = 0; i < indexes.length; ++i){
				from = indexes[i];
				to = m[from];
				var before = info[from].before = findBefore(to),
					after = info[from].after = findAfter(to);
				ranges.push({
					start: from,
					count: 1
				}, {
					start: after,
					count: 1
				});
				if(before >= 0){
					ranges.push({
						start: before,
						count: 1
					});
				}
			}
//            console.log('info:', info, cat);
			//Apply the change to store.
			inner._call('when', [{
				id: [],
				range: ranges
			}, function(){
				var size = inner._call('size');
				for(var i = 0; i < indexes.length; ++i){
					from = indexes[i];
					var fromItem = getItem(from),
						context = info[from],
						beforeValue = calcValue(context.before, size),
						afterValue = calcValue(context.after, size),
						value = (beforeValue + afterValue) / 2;
					context.value = value;
					setValue(fromItem, value);
				}
				saveStore();
			}]);
		},

		//Private--------------------------------------------------------------------
		_cmdMove: function(){
			//Process the move command
			var d = new Deferred, t = this,
				m = t.model, i, args,
				map = {}, moved, moves = [],
				size = t.inner._call('size');

			for(i = 0; args = arguments[i]; ++i){
				m._msg('beforeMove', args);
				if(args.length == 2){
					moves = moves.concat(getMoves(args[0], args[1]));
				}else{
					moves.push(args);
				}
			}
			for(i = 0; args = moves[i]; ++i){
				mapIndex(args[0], args[1], args[2], map);
			}
			for(i in map){
				moved = 1;
				break;
			}
			if(moved){
				t.updateStore(d, moves, map);
			}else{
				d.callback();
			}
			d.then(function(){
				m._cache.clear();
				m._msg('moved', map);
				m.onMoved(moves, map);
			});
			return d;
		}
	});
});

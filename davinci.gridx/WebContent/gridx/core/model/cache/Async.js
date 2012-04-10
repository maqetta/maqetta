define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"dojo/DeferredList",
	"./_Cache"
], function(declare, array, lang, Deferred, DeferredList, _Cache){

	var hitch = lang.hitch;

	function minus(rangesA, rangesB){
		//Minus index range list B from index range list A, 
		//assuming A and B do not have overlapped ranges.
		//This is a set operation
		if(!rangesB.length || !rangesA.length){
			return rangesA;
		}
		var indexes = [], f = 0, r, res = [],
			mark = function(idx, flag){
				indexes[idx] = indexes[idx] || 0;
				indexes[idx] += flag;
			},
			markRanges = function(ranges, flag){
				var i, r;
				for(i = ranges.length - 1; i >= 0; --i){
					r = ranges[i];
					mark(r.start, flag);
					if(r.count){
						mark(r.start + r.count, -flag);
					}
				}
			};
		markRanges(rangesA, 1);
		markRanges(rangesB, 2);
		for(var i = 0, len = indexes.length; i < len; ++i){
			if(indexes[i]){
				f += indexes[i];
				if(f === 1){
					res.push({
						start: i
					});
				}else{
					if(f === 3){
						res._overlap = true;
					}
					r = res[res.length - 1];
					if(r && !r.count){
						r.count = i - r.start;
					}
				}
			}
		}
		return res;
	}

	function mergeRanges(args){
		//Merge index ranges into separate ones.
		var ranges = [], r = args.range, i, t, a, b, c, merged;
		while(r.length > 0){
			c = a = r.pop();
			merged = 0;
			for(i = r.length - 1; i >= 0; --i){
				b = r[i];
				if(a.start < b.start){
					//make sure a is always after b, so the logic can be simplified
					t = b;
					b = a;
					a = t;
				}
				//If b is an open range, and starts before a, then b must include a.
				if(b.count){
					//b is a closed range, it's possible to overlap.
					if(a.start <= b.start + b.count){
						//overlap
						if(a.count && a.start + a.count > b.start + b.count){
							b.count = a.start + a.count - b.start;
						}else if(!a.count){
							b.count = null;
						}
						//otherwise, b includes a
					}else{
						//not overlap, try next range
						a = c;
						continue;
					}
				}
				//now n is a merged range
				r[i] = b;
				merged = 1;
				break;
			}
			if(!merged){
				//Can not merge, this is a sperate range
				ranges.push(c);
			}
		}
		args.range = ranges;
		return args;
	}

	function connectRanges(args, ps){
		//Connect small ranges into big ones to reduce request count
		//FIXME: find a better way to do this!
		var r = args.range, ranges = [], a, b;
		r.sort(function(a, b){
			return a.start - b.start;
		});
		while(r.length){
			a = r.shift();
			if(r.length){
				b = r[0];
				if(b.count && b.count + b.start - a.start <= ps){
					b.count = b.count + b.start - a.start;
					b.start = a.start;
					continue;
				}else if(!b.count && b.start - a.start < ps){
					b.start = a.start;
					continue;
				}
			}
			ranges.push(a);
		}
		args.range = ranges;
		return args;
	}

	function isNumber(n){
		return typeof n == 'number' && !isNaN(n);
	}

	return declare(_Cache, {
		// summary:
		//		
		isAsync: true,
		//By default, do not clear cache when scrolling, this is the same with DataGrid
		//cacheSize: -1,
		//pageSize: 100,
		
		constructor: function(model, args){
			var cs = args.cacheSize, ps = args.pageSize;
			this.cacheSize = isNumber(cs) ? cs : -1;
			this.pageSize = isNumber(ps) && ps > 0 ? ps : 100;
		},

		when: function(args, callback){
			var t = this,
				d = args._def = new Deferred,
				fail = hitch(d, d.errback),
				innerFail = function(e){
					t._requests.pop();
					fail(e);
				};
			t._fetchById(args).then(function(args){
				t._fetchByIndex(args).then(function(args){
					t._fetchByParentId(args).then(function(args){
						Deferred.when(args._req, function(){
							var err;
							if(callback){
								try{
									callback();
								}catch(e){
									err = e;
								}
							}
							t._requests.shift();
							//this is meaningless given current model impl
//                            if(!t.skipCacheSizeCheck && !t._requests.length){
//                                t._checkSize();
//                            }
							if(err){
								d.errback(err);
							}else{
								d.callback();
							}
						}, innerFail);
					}, innerFail);
				}, innerFail);
			}, fail);
			return d;
		},
	
		keep: function(id){
			var t = this, k = t._kept;
			if(t._cache[id] && t._struct[id] && !k[id]){
				k[id] = 1;
				++t._keptSize;
			}
		},
	
		free: function(id){
			var t = this;
			if(!id){
				t._kept = {};
				t._keptSize = 0;
			}else if(t._kept[id]){
				delete t._kept[id];
				--t._keptSize;
			}
		},

		clear: function(){
			var t = this;
			if(t._requests && t._requests.length){
				t._clearLock = 1;	//1 as true
				return;
			}
			t.inherited(arguments);
			t._requests = [];
			t._priority = [];
			t._kept = {};
			t._keptSize = 0;
		},

		//-----------------------------------------------------------------------------------------------------------
		_init: function(){},

		_findMissingIds: function(ids){
			var c = this._cache;
			return array.filter(ids, function(id){
				return !c[id];
			});
		},

		_searchRootLevel: function(ids){
			//search root level for missing ids
			var t = this,
				d = new Deferred,
				fail = hitch(d, d.errback),
				indexMap = t._struct[''],
				ranges = [],
				lastRange,
				premissing; //Whether the previous item is missing
			if(ids.length){
				for(var i = 1, len = indexMap.length; i < len; ++i){
					if(!indexMap[i]){
						if(premissing){
							lastRange.count++;
						}else{
							premissing = 1;
							ranges.push(lastRange = {
								start: i - 1,
								count: 1
							});
						}
					}
				}
				ranges.push({
					start: indexMap.length < 2 ? 0 : indexMap.length - 2
				});
			}
			var func = function(ids){
				if(ids.length && ranges.length){
					t._storeFetch(ranges.shift()).then(function(){
						func(t._findMissingIds(ids));
					}, fail);
				}else{
					d.callback(ids);
				}
			};
			func(ids);
			return d;
		},

		_searchChildLevel: function(ids){
			//Search children level of current level for missing ids
			var t = this,
				d = new Deferred,
				fail = hitch(d, d.errback),
				st = t._struct,
				parentIds = st[''].slice(1),
				func = function(ids){
					if(ids.length && parentIds.length){
						var pid = parentIds.shift();
						t._loadChildren(pid).then(function(){
							[].push.apply(parentIds, st[pid].slice(1));
							func(t._findMissingIds(ids));
						}, fail);
					}else{
						d.callback(ids);
					}
				};
			func(ids);
			return d;
		},
	
		_fetchById: function(args){
			//Although store supports query by id, it does not support get index by id, so must find the index by ourselves.
			var t = this, d = new Deferred, 
				i, r, len, pid,
				success = hitch(d, d.callback),
				fail = hitch(d, d.errback),
				ranges = args.range,
				isTree = t.store.getChildren;
			args.pids = [];
			if(isTree){
				for(i = ranges.length - 1; i >= 0; --i){
					r = ranges[i];
					pid = r.parentId;
					if(pid){
						args.id.push(pid);
						args.pids.push(pid);
						ranges.splice(i, 1);
					}
				}
			}
			var ids = t._findMissingIds(args.id), mis = [];
			if(ids.length){
				array.forEach(ids, function(id){
					var idx = t.idToIndex(id);
					if(idx >= 0 && !t.treePath(id).pop()){
						ranges.push({
							start: idx,
							count: 1
						});
					}else{
						mis.push(id);
					}
				});
				t._searchRootLevel(mis).then(function(ids){
					if(ids.length && isTree){
						t._searchChildLevel(ids).then(function(ids){
							if(ids.length){
								console.warn('Requested row ids are not found: ', ids);
							}
							success(args);
						}, fail);
					}else{
						success(args);
					}
				}, fail);
			}else{
				success(args);
			}
			return d;
		},

		_fetchByParentId: function(args){
			var t = this, d = new Deferred;
			new DeferredList(array.map(args.pids, function(pid){
				return t._loadChildren(pid);
			}), 0, 1).then(hitch(d, d.callback, args), hitch(d, d.errback));
			return d;
		},

		_fetchByIndex: function(args){
			var t = this, d = new Deferred;
			args = connectRanges(
					t._mergePendingRequests(
						t._findMissingIndexes(mergeRanges(args))), t.pageSize);
			new DeferredList(array.map(args.range, function(r){
				return t._storeFetch(r);
			}), 0, 1).then(hitch(d, d.callback, args), hitch(d, d.errback));
			return d;
		},
	
		_findMissingIndexes: function(args){
			//Removed loaded rows from the request index ranges.
			//generate unsorted range list.
			var i, j, r, end, newRange, ranges = [], t = this,
				indexMap = t._struct[''],
				totalSize = t._size[''];
			for(i = args.range.length - 1; i >= 0; --i){
				r = args.range[i];
				end = r.count ? r.start + r.count : indexMap.length - 1;
				newRange = 1;
				for(j = r.start; j < end; ++j){
					var id = indexMap[j + 1];
					if(!id || !t._cache[id]){
						if(newRange){
							ranges.push({
								start: j,
								count: 1
							});
						}else{
							++ranges[ranges.length - 1].count;
						}
						newRange = 0;
					}else{
						newRange = 1;
					}
				}
				if(!r.count){
					if(!newRange){
						delete ranges[ranges.length - 1].count;
					}else if(totalSize < 0 || j < totalSize){
						ranges.push({
							start: j
						});
					}
				}
			}
			args.range = ranges;
			return args;
		},

		_mergePendingRequests: function(args){
			var i, req, defs = [], reqs = this._requests;
			for(i = reqs.length - 1; i >= 0; --i){
				req = reqs[i];
				args.range = minus(args.range, req.range);
				if(args.range._overlap){
					defs.push(req._def);
				}
			}
			args._req = defs.length && new DeferredList(defs, 0, 1);
			reqs.push(args);
			return args;
		},
	
		_checkSize: function(){
			var t = this, id,
				cs = t.cacheSize,
				p = t._priority;
			if(t._clearLock){
				t._clearLock = 0;	//0 as false
				t.clear();
			}else if(cs >= 0){
				cs += t._keptSize;
//                console.warn("### Cache size:", p.length,
//                        ", To release: ", p.length - cs,
//                        ", Keep size: ", this._keptSize);
				while(p.length > cs){
					id = p.shift();
					if(t._kept[id]){
						p.push(id);
					}else{
						delete t._cache[id];
					}
				}
			}
		}
	});
});

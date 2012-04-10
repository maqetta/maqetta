define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom",
	"dojo/_base/window",
	"dojo/_base/sniff",
	"dojo/dnd/Source",
	"dojo/dnd/Manager",
	"../../core/_Module",
	"../AutoScroll"
], function(declare, lang, Deferred, domConstruct, domGeometry, domClass, domStyle, dom, win, sniff,
	Source, DndManager, _Module){

	var hitch = lang.hitch;

	return _Module.register(
	declare(_Module, {
		name: '_dnd',

		constructor: function(){
			var t = this,
				g = t.grid,
				doc = win.doc;
			t.accept = [];
			t._profiles = {};
			t._selectStatus = {};
			t._node = domConstruct.create('div');
			t.batchConnect(
	            [g, 'onCellMouseOver', '_checkDndReady'],
	            [g, 'onCellMouseOut', '_dismissDndReady'],
	            [g, 'onCellMouseDown', '_beginDnd'],
				[doc, 'onmouseup', '_endDnd'],
				[doc, 'onmousemove', '_onMouseMove']
			);
			t.subscribe("/dnd/cancel", '_endDnd');
		},

		load: function(args){
			var t = this,
				n = t.grid.bodyNode;
			t._source = new Source(n, {
				isSource: false,
				accept: t.accept,
				getSelectedNodes: function(){return [0];},
				getItem: hitch(t, '_getItem'),
				checkAcceptance: hitch(t, '_checkAcceptance'),
				onDraggingOver: hitch(t, '_onDraggingOver'),
				onDraggingOut: hitch(t, '_onDraggingOut'),
				onDropExternal: hitch(t, '_onDropExternal'),
				onDropInternal: hitch(t, '_onDropInternal')
			});
			if(sniff('ff')){
				t._fixFF(t._source, n);
			}
			t._source.grid = t.grid;
			t._saveSelectStatus();
			t.loaded.callback();
		},
		
		destory: function(){
			this.inherited(arguments);
			this._source.destory();
			domConstruct.destroy(this._node);
		},
	
		getAPIPath: function(){
			return {
				dnd: {
					_dnd: this
				}
			};
		},

		//Public----------------------------------------------------------------------
		profile: null,

		register: function(name, profile){
			this._profiles[name] = profile;
			[].push.apply(this.accept, profile.arg('accept'));
		},
		
		//Private-----------------------------------------------------------------
		_fixFF: function(source){
			return this.connect(win.doc, 'onmousemove', function(evt){
				var pos = domGeometry.position(source.node),
					x = evt.clientX,
					y = evt.clientY,
					alreadyIn = source._alreadyIn;
				isIn = y >= pos.y && y <= pos.y + pos.h && x >= pos.x && x <= pos.x + pos.w;
				if(!alreadyIn && isIn){
					source._alreadyIn = 1;	//1 as true
					source.onOverEvent();
				}else if(alreadyIn && !isIn){
					source._alreadyIn = 0;	//0 as false
					source.onOutEvent();
				}
			});
		},
	
		_onMouseMove: function(evt){
			var t = this;
			if(t._alreadyIn && (t._dnding || t._extDnding)){
				t._markTargetAnchor(evt);
			}
		},

		_saveSelectStatus: function(enabled){
			var name, selector, selectors = this.grid.select;
			if(selectors){
				for(name in selectors){
					selector = selectors[name];
					if(selector && lang.isObject(selector)){
						this._selectStatus[name] = selector.arg('enabled');
						if(enabled !== undefined){
							selector.enabled = enabled;
						}
					}
				}
			}
		},

		_loadSelectStatus: function(){
			var name, selector, selectors = this.grid.select;
			if(selectors){
				for(name in selectors){
					selector = selectors[name];
					if(selector && lang.isObject(selector)){
						selector.enabled = this._selectStatus[name];
					}
				}
			}
		},

		_checkDndReady: function(evt){
			var t = this, name, p;
			if(!t._dndReady && !t._dnding && !t._extDnding){
				for(name in t._profiles){
					p = t._profiles[name];
					if(p.arg('enabled') && p._checkDndReady(evt)){
						t.profile = p;
						t._saveSelectStatus(false);
						domClass.add(win.body(), 'gridxDnDReadyCursor');
						t._dndReady = 1;
						return;
					}
				}
			}
		},
		
		_dismissDndReady: function(){
			if(this._dndReady){
				this._loadSelectStatus();
				this._dndReady = 0;	//0 as false
				domClass.remove(win.body(), 'gridxDnDReadyCursor');
			}
		},

		_beginDnd: function(evt){
			var t = this;
			t._checkDndReady(evt);
			if(t._dndReady){
				var p = t.profile,
					m = DndManager.manager();
				t._source.isSource = true;
				t._source.canNotDragOut = !p.arg('provide').length;
				t._node.innerHTML = p._buildDndNodes();
				t._oldStartDrag = m.startDrag;
				m.startDrag = hitch(t, '_startDrag', evt);
				
				if(t.avatar){
					t._oldMakeAvatar = m.makeAvatar;
					m.makeAvatar = function(){
						return new t.avatar(m);
					};
				}
				m._dndInfo = {
					cssName: p._cssName,
					count: p._getDndCount()
				};
				p._onBeginDnd(t._source);
				dom.setSelectable(t.grid.domNode, false);	
			}
		},
	
		_endDnd: function(){
			var t = this,
				m = DndManager.manager();
			t._source.isSource = false;
			t._alreadyIn = 0;	//0 as false
			delete m._dndInfo;
			if(t._oldStartDrag){
				m.startDrag = t._oldStartDrag;
				delete t._oldStartDrag;
			}
			if(t._oldMakeAvatar){
				m.makeAvatar = t._oldMakeAvatar;
				delete t._oldMakeAvatar;
			}
			if(t._dndReady || t._dnding || t._extDnding){
				t._dnding = t._extDnding = 0;	//0 as false
				t._destroyUI();
				dom.setSelectable(t.grid.domNode, true);
				domClass.remove(win.body(), 'gridxDnDReadyCursor');
				t.profile._onEndDnd();
				t._loadSelectStatus();
			}
		},
		
		_createUI: function(){
			domClass.add(win.body(), 'gridxDnDCursor');
			if(this.grid.autoScroll){
				this.profile._onBeginAutoScroll();
				this.grid.autoScroll.enabled = true;
			}
		},
	
		_destroyUI: function(){
			var t = this;
			t._unmarkTargetAnchor();
			domClass.remove(win.body(), 'gridxDnDCursor');
			if(t.grid.autoScroll){
				t.profile._onEndAutoScroll();
				t.grid.autoScroll.enabled = false;
			}
		},
	
		_createTargetAnchor: function(){
			return domConstruct.create("div", {
				"class": "gridxDnDAnchor"
			});
		},
		
		_markTargetAnchor: function(evt){
			var t = this;
			if(t._extDnding || t.profile.arg('canRearrange')){
				var targetAnchor = t._targetAnchor,
					containerPos = domGeometry.position(t.grid.mainNode);
				if(!targetAnchor){
					targetAnchor = t._targetAnchor = t._createTargetAnchor();
					targetAnchor.style.display = "none";
					t.grid.mainNode.appendChild(targetAnchor);
				}
				domClass.add(targetAnchor, 'gridxDnDAnchor' + t.profile._cssName);
				var pos = t.profile._calcTargetAnchorPos(evt, containerPos);
				if(pos){
					domStyle.set(targetAnchor, pos);
					targetAnchor.style.display = "block";
				}else{
					targetAnchor.style.display = "none";
				}
			}
		},
		
		_unmarkTargetAnchor: function(){
			var targetAnchor = this._targetAnchor;
			if(targetAnchor){
				targetAnchor.style.display = "none";
				domClass.remove(targetAnchor, 'gridxDnDAnchor' + this.profile._cssName);
			}
		},
		
		//---------------------------------------------------------------------------------
		_startDrag: function(evt, source, nodes, copy){
			var t = this;
			if(t._dndReady && source === t._source){
				t._oldStartDrag.call(DndManager.manager(), source, t._node.childNodes, copy);
				t._dndReady = 0;	//0 as false
				t._dnding = t._alreadyIn = 1;	//1 as true
				t._createUI();
				t._markTargetAnchor(evt);
			}
		},
		
		_getItem: function(id){
			return {
				type: this.profile.arg('provide'),
				data: this.profile._getItemData(id)
			};
		},
		
		_checkAcceptance: function(source, nodes){
			var t = this,
				getHash = function(arr){
					var res = {};
					for(var i = arr.length - 1; i >= 0; --i){
						res[arr[i]] = 1;
					}
					return res;
				},
				checkAcceptance = Source.prototype.checkAcceptance,
				res = checkAcceptance.apply(t._source, arguments);
			if(res){
				if(source.grid === t.grid){
					return t.profile.arg('canRearrange');
				}
				if(!source.canNotDragOut){
					for(var name in t._profiles){
						var p = t._profiles[name];
						var accepted = checkAcceptance.apply({
							accept: getHash(p.arg('accept'))
						}, arguments);
						if(p.arg('enabled') && accepted &&
							(!p.checkAcceptance || p.checkAcceptance.apply(p, arguments))){
							t.profile = p;
							t._extDnding = 1;	//1 as true
							return true;
						}
					}
				}
			}
			return false;
		},
		
		_onDraggingOver: function(){
			var t = this;
			if(t._dnding || t._extDnding){
				t._alreadyIn = 1;	//1 as true
				t._createUI();
			}
		},
		
		_onDraggingOut: function(){
			var t = this;
			if(t._dnding || t._extDnding){
				t._alreadyIn = 0;	//0 as false
				t._destroyUI();
			}
		},

		_onDropInternal: function(nodes, copy){
			this.profile._onDropInternal(nodes, copy);
		},
		
		_onDropExternal: function(source, nodes, copy){
			var t = this, dropped = t.profile._onDropExternal(source, nodes, copy);
			Deferred.when(dropped, function(){
				if(!copy){
					if(source.grid){
						source.grid.dnd._dnd.profile.onDraggedOut(t._source);
					}else{
						source.deleteSelectedNodes();
					}
				}
			});
		}
	}));
});

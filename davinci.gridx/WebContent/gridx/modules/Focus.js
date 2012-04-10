define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/keys",
	"../core/_Module",
	"../util"
], function(declare, array, connect, lang, keys, _Module, util){
	
	/*=====
		gridx.modules.Focus.__FocusArea = function(){
			// name: String (mandatory)
			//		The name of this area. Must be unique. Must not be empty.
			//
			// priority: Number (mandatory)
			//		This number decides the position of this area in the TAB sequence.
			//		Areas with bigger priority number, their position in TAB sequence comes later.
			//		If two areas have the same priority, then the later registered area is put *above* the earlier one.
			//		That is, no matter TAB or SHIFT-TAB, the upper area is accessed first.
			//
			// focusNode: DOM-Node?
			//		If provided, this is the node of this area. 
			//		When this area is focused, *onFocus* will be called. When blurred, *onBlur* will be called.
			//
			// scope: anything?
			//		If provided, all area functions are called on this scope.
			//
			// doFocus: Function(evt, step)?
			//		If provided, will be called when TABing to this area.
			//		If not provided, default to successful focus.
			//		Return TRUE if successfully focused. FALSE if not.
			//
			// doBlur: Function(evt, step)?
			//		If provided, will be called when TABing out of this area.
			//		If not provided, default to successful blur.
			//		Return TRUE if successfully blurred. FALSE if not.
			//
			// onFocus: function(evt)?
			//		If provided, will be called when the *focusNode* of this area is focused.
			//		If return TRUE, later areas on this node will be skipped and this area becomes the current focused area.
			//		If return FALSE, call later areas on this same node.
			//
			// onBlur: function(evt)?
			//		If provided, will be called when the *focusNode* of this area is blurred.
			//		When *focusNode* is blurred, only the currently focused area will be called.
		};
	=====*/
	
	return _Module.register(
	declare(/*===== "gridx.modules.Focus", =====*/_Module, {
		// summary
		//		This module controls the TAB sequence of all the UI modules.
		//		But this module is (or at least can be) a non-UI module, because it does not handle the actual focus job.
		
		name: 'focus',
		
		getAPIPath: function(){
			return {
				focus: this
			};
		},

		constructor: function(){
			this._areas = {};
			this._tabQueue = [];
			this._focusNodes = [];
		},

		preload: function(){
			var g = this.grid, n = g.domNode;
			this.batchConnect(
				[n, 'onmousedown', '_onMouseDown'],
				[n, 'onkeydown', '_onTabDown'],
				[n, 'onfocus', '_focus'],
				[g.lastFocusNode, 'onfocus', '_focus'],
				[g, 'onBlur', '_doBlur']
			);
		},
	
		destroy: function(){
			var t = this;
			t._areas = null;
			t._areaQueue = null;
			t._focusNodes = [];
			t._queueIdx = -1;
			t.inherited(arguments);
		},
	
		//Public----------------------------------------------------------
		registerArea: function(/* __FocusArea */ area){
			// summary:
			//		Register a new focus area, so this area will be included in the TAB sequence.
			//		If there's an existing area with the same name, it is removed and replaced by the new area.
			//		This function always succeed. No exception.
			// tags:
			//		package
			// area: __FocusArea
			//		A focus area definition.
			if(area && area.name && typeof area.priority == 'number'){
				var t = this,
					tq = t._tabQueue,
					init = function(fn){
						area[fn] = area[fn] ? lang.hitch(area.scope || area, area[fn]) : function(){ return true; };
					};
				if(t._areas[area.name]){
					t.removeArea(area.name);
				}
				init('doFocus');
				init('doBlur');
				init('onFocus');
				init('onBlur');
				area.connects = area.connects || [];
	
				t._areas[area.name] = area;
				var i = util.biSearch(tq, function(a){
					return a.p - area.priority;
				});
				//If the priority is the same, put this area above the current one.
				if(tq[i] && tq[i].p === area.priority){
					tq[i].stack.unshift(area.name);
					//Assuming areas with same priority must have same focusNode.
					t._focusNodes[i] = area.focusNode || t._focusNodes[i];
				}else{
					tq.splice(i, 0, {
						p: area.priority,
						stack: [area.name]
					});
					t._focusNodes.splice(i, 0, area.focusNode);
				}
			}
		},
		//_tabQueue: [{p: 1, stack: ['name']}]
	
		focusArea: function(/* String */ areaName, forced){
			// summary:
			//		Focus the area with name of *areaName*.
			//		If the current area is not this area, blur the current area.
			//		If the current area is this area, this is a no-op and return TRUE.
			//		If the area with this name does not exist, this is a no-op and return FALSE.
			// tags:
			//		package
			// return: Boolean
			//		TRUE if the focus is successful, FALSE if not.	
			var t = this, area = t._areas[areaName];
			if(area){
				var curArea = t._areas[t.currentArea()];
				if(curArea && curArea.name === areaName){
					if(forced){
						curArea.doFocus();
					}
					return true;
				}else if(!curArea || curArea.doBlur()){
					if(curArea){
						t.onBlurArea(curArea.name);
					}
					if(area.doFocus()){
						t.onFocusArea(area.name);
						t._updateCurrentArea(area);
						return true;
					}
					t._updateCurrentArea();
				}
			}
			return false;
		},
	
		currentArea: function(){
			// summary:
			//		Get the name of the current focus area. 
			// tags:
			//		package
			// return: String
			//		The name of the current Area. Return "" if no area is focused.
			var a = this._tabQueue[this._queueIdx];
			return a ? a.stack[this._stackIdx] : '';
		},
	
		tab: function(step, evt){
			// summary:
			//		Move focus from one area to another.
			// tags:
			//		package
			// step: Integer
			//		If positive, then move forward along the TAB sequence.
			//		If negative, then move backward along the TAB sequence (SHIFT-TAB).
			//		If zero or other invalid values, this is a no-op.
			//		The absolute value of *step* is the distance between the target area and the current area
			//		in the whole TAB sequence.
			// evt: Object
			//		This can either be a real Event object or a mock object with same information .
			// return: String
			//		The name of currently focused area. Return "" if no area is focused.
			var t = this,
				areas = t._areas,
				curArea = areas[t.currentArea()];
			if(!step){
				return curArea ? curArea.name : '';
			}
			var cai = t._queueIdx + step,
				dir = step > 0 ? 1 : -1,
				tq = t._tabQueue;
			if(curArea){
				var blurResult = curArea.doBlur(evt, step),
					nextArea = areas[blurResult];
				if(blurResult){
					t.onBlurArea(curArea.name);
				}
				if(nextArea && nextArea.doFocus(evt, step)){
					t.onFocusArea(nextArea.name);
					t._updateCurrentArea(nextArea);
					return nextArea.name;
				}else if(!blurResult){
					return curArea.name;
				}
			}
			for(; cai >= 0 && cai < tq.length; cai += dir){
				var i, stack = tq[cai].stack;
				for(i = 0; i < stack.length; ++i){
					var areaName = stack[i];
					if(areas[areaName].doFocus(evt, step)){
						t.onFocusArea(areaName);
						t._queueIdx = cai;
						t._stackIdx = i;
						return areaName;
					}
				}
			}
			t._tabingOut = 1;
			if(step < 0){
				t._queueIdx= -1;
				t.grid.domNode.focus();
			}else{
				t._queueIdx = tq.length;
				t.grid.lastFocusNode.focus();
			}
			return "";
		},
	
		removeArea: function(areaName){
			// summary:
			//		Remove the area with name of *areaName*.
			//		If there's no such area, this is a no-op and return FALSE.
			//		If currently focused area is removed, then current area becomes empty.
			// tags:
			//		package
			// areaName: String
			//		The name of the area to be removed.
			// return: Boolean
			//		TRUE if this operation is successful, FALSE if not.
			var t = this, area = t._areas[areaName];
			if(area){
				if(t.currentArea() === areaName){
					t._updateCurrentArea();
				}
				var i = util.biSearch(t._tabQueue, function(a){
						return a.p - area.priority;
					}), j, 
					stack = t._tabQueue[i].stack;
				for(j = stack.length - 1; j >= 0; --j){
					if(stack[j] === area.name){
						stack.splice(j, 1);
						break;
					}
				}
				if(!stack.length){
					t._tabQueue.splice(i, 1);
					t._focusNodes.splice(i, 1);
				}
				array.forEach(area.connects, connect.disconnect);
				delete t._areas[areaName];
				return true;
			}
			return false;
		},

		onFocusArea: function(/* String areaName */){
			// summary:
			//		Fired when an area is focused.
			// tags:
			//		callback
		},

		onBlurArea: function(/* String areaName */){
			// summary:
			//		Fired when an area is blurred.
			// tags:
			//		callback
		},
	
		//Private----------------------------------------------------------
		//_areas: null,
		//_tabQueue: null,
		//_focusNodes: null,
		_queueIdx: -1,
		_stackIdx: 0,
	
		_onTabDown: function(evt){
			if(evt.keyCode === keys.TAB){
				this.tab(evt.shiftKey ? -1 : 1, evt);
			}
		},
	
		//-----------------------------------------------------------------------
		_onMouseDown: function(evt){
			var t = this, i, j, stack, area,
				dn = t.grid.domNode,
				n = evt.target,
				currentArea = t._areas[t.currentArea()];
			while(n && n !== dn){
				i = array.indexOf(t._focusNodes, n);
				if(i >= 0){
					stack = t._tabQueue[i].stack;
					for(j = 0; j < stack.length; ++j){
						area = t._areas[stack[j]];
						if(area.onFocus(evt)){
							if(currentArea && currentArea.name !== area.name){
								currentArea.onBlur(evt);
								t.onBlurArea(currentArea.name);
							}
							t.onFocusArea(area.name);
							t._queueIdx = i;
							t._stackIdx = j;
							return;
						}
					}
					return;
				}
				n = n.parentNode;
			}
			if(n == dn && currentArea){
				t._doBlur(evt, currentArea);
			}
			if(!n || n == dn){
				util.stopEvent(evt);
			}
		},
		
		_focus: function(evt){
			var t = this;
			if(t._tabingOut){
				t._tabingOut = 0;
			}else if(evt.target == t.grid.domNode){
				t._queueIdx = -1;
				t.tab(1);
			}else if(evt.target === t.grid.lastFocusNode){
				t._queueIdx = t._tabQueue.length;
				t.tab(-1);
			}
		},
		
		_doBlur: function(evt, area){
			var t = this;
			if(!area && t.currentArea()){
				area = t._areas[t.currentArea()];
			}
			if(area){
				area.onBlur(evt);
				t.onBlurArea(area.name);
				t._updateCurrentArea();
			}
		},
		
		_updateCurrentArea: function(area){
			var t = this, tq = t._tabQueue;
			if(area){
				var i = t._queueIdx = util.biSearch(tq, function(a){
						return a.p - area.priority;
					}),
					stack = tq[i].stack;
				t._stackIdx = array.indexOf(stack, area.name);
			}else{
				t._queueIdx = null;
				t._stackIdx = 0;
			}
		}
	}));
});

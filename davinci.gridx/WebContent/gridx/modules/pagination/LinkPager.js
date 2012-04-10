define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/_base/query",
	"dojo/dom-class",
	"dojo/string",
	"dojo/keys",
	"../../util",
	"./_PagerBase",
	"dojo/text!../../templates/PaginationBar.html"
], function(declare, array, lang, sniff, query, domClass, string, keys, util, _PagerBase, barTemplate){

	var hasClass = domClass.contains,
		toggle = domClass.toggle,
		substitute = string.substitute;

	function findNodeByEvent(evt, targetClass, containerClass){
		var n = evt.target;
		while(!hasClass(n, targetClass)){
			if(hasClass(n, containerClass)){
				return null;
			}
			n = n.parentNode;
		}
		return n;
	}

	function toggleHover(evt, targetCls, containerCls, hoverCls){
		var n = findNodeByEvent(evt, targetCls, containerCls);
		if(n){
			toggle(n, hoverCls, evt.type == 'mouseover');
		}
	}

	function focus(nodes, node, isMove, isLeft, isFocusable){
		//Try to focus on node, but if node is not focsable, find the next focusable node in nodes 
		//along the given direction. If not found, try the other direction.
		//Return the node if successfully focused, null if not.
		var dir = isLeft ? -1 : 1,
			i = node ? array.indexOf(nodes, node) + (isMove ? dir : 0) : (isLeft ? nodes.length - 1 : 0),
			findNode = function(i, dir){
				while(nodes[i] && !isFocusable(nodes[i])){
					i += dir;
				}
				return nodes[i];
			};
		node = findNode(i, dir) || findNode(i - dir, -dir);
		if(node){
			node.focus();
		}
		return node;
	}

	return declare(_PagerBase, {
		templateString: barTemplate,
	
		_tabIndex: -1,
	
		postMixInProperties: function(){
			if(sniff('ie')){
				//IE does not support inline-block, so have to set tabIndex
				var gridTabIndex = this.module.grid.domNode.getAttribute('tabindex');
				this._tabIndex = gridTabIndex > 0 ? gridTabIndex : 0;
			}
		},
	
		refresh: function(){
			var t = this;
			t._createDescription();
			t._createPageStepper();
			t._createPageSizeSwitch();
			t._createGotoButton();
		},
	
		_onSwitchPage: function(){
			this._createPageStepper();
			this.module.grid.vLayout.reLayout();
		},

		_onSizeChange: function(){
			this._createDescription();
			this._onSwitchPage();
		},

		_focusArea: function(){
			var focus = this.module.grid.focus;
			return focus && focus.currentArea();
		},
	
		_onChangePageSize: function(size, oldSize){
			var t = this,
				n = query('[pagesize="' + size + '"]', t._sizeSwitchContainer)[0];
			if(n){
				domClass.add(n, 'gridxPagerSizeSwitchBtnActive');
			}
			n = query('[pagesize="' + oldSize + '"]', t._sizeSwitchContainer)[0];
			if(n){
				domClass.remove(n, 'gridxPagerSizeSwitchBtnActive');
			}
			if(t._focusArea() == t.position + 'PageSizeSwitch'){
				t._findNextPageSizeSwitch();
			}
			t._createPageStepper();
			t.module.grid.vLayout.reLayout();
		},
		
		_createPageStepper: function(){
			var t = this, mod = t.module;
			if(t._toggleNode('gridxPagerStepper', mod._exist(t.position, 'stepper'))){
				var p = t.pagination,
					pageCount = p.pageCount(),
					currentPage = p.currentPage(),
					count = mod.arg('visibleSteppers'),
					sb = [], tabIndex = t._tabIndex,
					disableNext = false,
					disablePrev = false,
					nlsArr = [
						mod.arg('pageIndexTitleTemplate', t.pageIndexTitle),
						mod.arg('pageIndexWaiTemplate', t.pageIndexWai),
						mod.arg('pageIndexTemplate', t.pageIndex)
					],
					ellipsis = '<span class="gridxPagerStepperEllipsis">&hellip;</span>',
					stepper = function(page){
						return ['<span class="gridxPagerStepperBtn gridxPagerPage ',
							currentPage == page ? 'gridxPagerStepperBtnActive' : '',
							'" pageindex="', page,
							'" title="', substitute(nlsArr[0], [page + 1]),
							'" aria-label="', substitute(nlsArr[1], [page + 1]),
							'" tabindex="', tabIndex, '">', substitute(nlsArr[2], [page + 1]),
						'</span>'].join('');
					};
				if(pageCount){
					var firstPage = currentPage - Math.floor((count - 1) / 2),
						lastPage = firstPage + count - 1;
					if(firstPage < 1){
						firstPage = 1;
						lastPage = count - 1;
					}else if(pageCount > count && firstPage >= pageCount - count){
						firstPage = pageCount - count;
					}
					if(lastPage >= pageCount - 1){
						lastPage = pageCount - 2;
					}
					sb.push(stepper(0));
					if(pageCount > 2){
						if(firstPage > 1){
							sb.push(ellipsis);
						}
						for(var i = firstPage; i <= lastPage; ++i){
							sb.push(stepper(i));
						}
						if(lastPage < pageCount - 2){
							sb.push(ellipsis);
						}
					}
					if(pageCount > 1){
						sb.push(stepper(pageCount - 1));
					}
				}
				t._pageBtnContainer.innerHTML = sb.join('');
				
				if(!currentPage || currentPage === pageCount - 1){
					disablePrev = !currentPage || pageCount <= 1;
					disableNext = currentPage || pageCount <= 1;
				}
				toggle(t._nextPageBtn, 'gridxPagerStepperBtnDisable gridxPagerNextPageDisable', disableNext);
				toggle(t._prevPageBtn, 'gridxPagerStepperBtnDisable gridxPagerPrevPageDisable', disablePrev);
		
				if(t._focusArea() == t.position + 'PageStepper'){
					t._findNextPageStepperBtn();
				}
			}	
		},	
	
		_gotoPrevPage: function(){
			this._focusPageIndex = 'Prev';
			var p = this.pagination;
			p.gotoPage(p.currentPage() - 1);
		},
	
		_gotoNextPage: function(){
			this._focusPageIndex = 'Next';
			var p = this.pagination;
			p.gotoPage(p.currentPage() + 1);
		},

		_gotoPage: function(evt){
			var n = findNodeByEvent(evt, 'gridxPagerStepperBtn', 'gridxPagerPages');
			if(n){
				var page = this._focusPageIndex = n.getAttribute('pageindex');
				this.pagination.gotoPage(parseInt(page, 10));
			}
		},
	
		_onHoverPageBtn: function(evt){
			toggleHover(evt, 'gridxPagerStepperBtn', 'gridxPagerPages', 'gridxPagerStepperBtnHover');
		},

		_onHoverSizeBtn: function(evt){
			toggleHover(evt, 'gridxPagerSizeSwitchBtn', 'gridxPagerSizeSwitch', 'gridxPagerSizeSwitchBtnHover');
		},
	
		_createPageSizeSwitch: function(){
			var t = this, mod = t.module;
			if(t._toggleNode('gridxPagerSizeSwitch', mod._exist(t.position, 'sizeSwitch'))){
				var sb = [], tabIndex = t._tabIndex,
					separator = mod.arg('sizeSeparator'),
					currentSize = t.pagination.pageSize(),
					nlsArr = [
						mod.arg('pageSizeTitleTemplate', t.pageSizeTitle),
						mod.arg('pageSizeWaiTemplate', t.pageSizeWai),
						mod.arg('pageSizeTemplate', t.pageSize),
						mod.arg('pageSizeAllTitleText', t.pageSizeAllTitle),
						mod.arg('pageSizeAllWaiText', t.pageSizeAllWai),
						mod.arg('pageSizeAllText', t.pageSizeAll)
					];
		
				array.forEach(mod.arg('sizes'), function(pageSize){
					var isAll = false;
					//pageSize might be invalid inputs, so be strict here.
					if(!(pageSize > 0)){
						pageSize = 0;
						isAll = true;
					}
					sb.push('<span class="gridxPagerSizeSwitchBtn ',
						currentSize === pageSize ? 'gridxPagerSizeSwitchBtnActive' : '',
						'" pagesize="', pageSize,
						'" title="', isAll ? nlsArr[3] : substitute(nlsArr[0], [pageSize]),
						'" aria-label="', isAll ? nlsArr[4] : substitute(nlsArr[1], [pageSize]),
						'" tabindex="', tabIndex, '">', isAll ? nlsArr[5] : substitute(nlsArr[2], [pageSize]),
						'</span>',
						//Separate the "separator, so we can pop the last one.
						'<span class="gridxPagerSizeSwitchSeparator">' + separator + '</span>');
				});
				sb.pop();
				t._sizeSwitchContainer.innerHTML = sb.join('');
			}
		},
	
		_switchPageSize: function(evt){
			var n = findNodeByEvent(evt, 'gridxPagerSizeSwitchBtn', 'gridxPagerSizeSwitch');
			if(n){
				var pageSize = this._focusPageSize = n.getAttribute('pagesize');
				this.pagination.setPageSize(parseInt(pageSize, 10));
			}
		},
		
		_createGotoButton: function(){
			this._toggleNode('gridxPagerGoto', this.module._exist(this.position, 'gotoButton'));
		},

		_showGotoDialog: function(){
			var t = this, mod = t.module;
			if(!t._gotoDialog){
				var cls = mod.arg('dialogClass'),
					gppane = mod.arg('gotoPagePane'),
					props = lang.mixin({
						title: t.gotoDialogTitle,
						content: new gppane({
							pager: t
						})
					}, mod.arg('dialogProps') || {});
				t._gotoDialog = new cls(props);
			}
			var pageCount = t.pagination.pageCount(),
				pane = t._gotoDialog.content;
			pane.pageCountMsgNode.innerHTML = substitute(t.gotoDialogPageCount, [pageCount]);
			pane.pageInputBox.constraints = {
				fractional: false, 
				min: 1, 
				max: pageCount
			};
			t._gotoDialog.show();
		},

		//Focus--------------------------------------------------------------------------------
		_initFocus: function(){
			var t = this, g = t.module.grid, focus = g.focus;
			if(focus){
				var p = g.pagination, pos = t.position, fp = t.focusPriority,
					leftKey = g.isLeftToRight() ? keys.LEFT_ARROW : keys.RIGHT_ARROW;

				focus.registerArea({
					name: pos + 'PageStepper',
					priority: fp,
					focusNode: t._pageStepperContainer,
					doFocus: lang.hitch(t, t._findNextPageStepperBtn, false, false)
				});
				t.connect(t._pageStepperContainer, 'onkeypress', function(evt){
					if(evt.keyCode == keys.LEFT_ARROW || evt.keyCode == keys.RIGHT_ARROW){
						t._findNextPageStepperBtn(true, evt.keyCode == leftKey);
					}else if(evt.keyCode == keys.ENTER && 
						hasClass(evt.target, 'gridxPagerStepperBtn') && 
						!hasClass(evt.target, 'gridxPagerStepperBtnActive') &&
						!hasClass(evt.target, 'gridxPagerStepperBtnDisable')){
						if(isNaN(parseInt(t._focusPageIndex, 10))){
							t['_goto' + t._focusPageIndex + 'Page']();
						}else{
							p.gotoPage(parseInt(t._focusPageIndex, 10));
						}
					}
				});

				focus.registerArea({
					name: pos + 'PageSizeSwitch',
					priority: fp + 0.001,
					focusNode: t._sizeSwitchContainer,
					doFocus: lang.hitch(t, t._findNextPageSizeSwitch, false, false)
				});
				t.connect(t._sizeSwitchContainer, 'onkeypress', function(evt){
					if(evt.keyCode == keys.LEFT_ARROW || evt.keyCode == keys.RIGHT_ARROW){
						t._findNextPageSizeSwitch(true, evt.keyCode == leftKey);
					}else if(evt.keyCode == keys.ENTER &&
						hasClass(evt.target, 'gridxPagerSizeSwitchBtn') &&
						!hasClass(evt.target, 'gridxPagerSizeSwitchBtnActive')){
						p.setPageSize(parseInt(t._focusPageSize, 10));
					}
				});

				focus.registerArea({
					name: pos + 'GotoPage',
					priority: fp + 0.002,
					focusNode: t._gotoBtn,
					doFocus: function(evt){
						util.stopEvent(evt);
						t._gotoBtn.focus();
						return true;
					}
				});
				t.connect(t._gotoBtn, 'onkeypress', function(evt){
					if(evt.keyCode == keys.ENTER){
						t._showGotoDialog();
					}
				});
			}
		},

		_findNextPageSizeSwitch: function(isMove, isLeft, evt){
			util.stopEvent(evt);
			var t = this,
				c = t._sizeSwitchContainer,
				n = query('[pagesize="' + t._focusPageSize + '"]', c)[0];
			n = focus(query('.gridxPagerSizeSwitchBtn', c), n, isMove, isLeft, function(node){
				return !hasClass(node, 'gridxPagerSizeSwitchBtnActive');
			});
			if(n){
				t._focusPageSize = n.getAttribute('pagesize');
			}
			return n;
		},

		_findNextPageStepperBtn: function(isMove, isLeft, evt){
			util.stopEvent(evt);
			var t = this,
				c = t._pageStepperContainer,
				n = query('[pageindex="' + t._focusPageIndex + '"]', c)[0];
			n = focus(query('.gridxPagerStepperBtn', c), n, isMove, isLeft, function(node){
				return !hasClass(node, 'gridxPagerStepperBtnActive') &&
					!hasClass(node, 'gridxPagerStepperBtnDisable');
			});
			if(n){
				t._focusPageIndex = n.getAttribute('pageindex');
			}
			return n;
		}
	});
});

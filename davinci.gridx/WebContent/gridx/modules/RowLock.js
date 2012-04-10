define([
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"../core/_Module",
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/html",
	"dojo/query"
], function(dojo, lang, _Module, declare, array, html, query){
	return _Module.register(declare(_Module, {
		name: 'rowLock',
		required: ['vLayout'],
		forced: ['hLayout', 'vScroller'],
		count: 0,
		getAPIPath: function(){
			return {
				rowLock: this
			};
		},
		load: function(args, deferStartup){
			dojo.experimental('gridx/modules/RowLock');
			this.count = this.arg('count');
			var _this = this, g = this.grid;
			deferStartup.then(function(){
				_this.connect(g.vScrollerNode, 'onscroll', function(){
					_this._updatePosition();
				});
				_this.loaded.callback();
			});
		},
		lock: function(count){
			this.unlock();
			this.count = count;
			this._foreachLockedRows(function(node){
				node.style.position = 'absolute';
				html.addClass(node, 'gridxLockedRow');
			});
			this._adjustBody();
			this._updatePosition();
		},
		unlock: function(){
			this._foreachLockedRows(function(node){
				node.style.position = 'static';
				html.removeClass(node, 'gridxLockedRow');
			});
			this.grid.bodyNode.style.paddingTop = '0px';
			this.count = 0;
			
		},
		_adjustBody: function(){
			//summary:
			//	Called after content is changed or column width is resized, which
			//	may cause row height change of locked rows.
			var h = 0;
			this._foreachLockedRows(function(node){
				h += node.offsetHeight;
			});
			this.grid.bodyNode.style.paddingTop = h + 'px';
		},
		_updatePosition: function(){
			//summary:
			//	Update position of locked rows so that they look like locked.
			if(!this.count){return;}
			var t = this.grid.bodyNode.scrollTop, h = 0, _this = this;
			this._foreachLockedRows(function(node){
				node.style.top = t + h + 'px';
				h += node.offsetHeight;
			});
		},
		_foreachLockedRows: function(callback){
			var nodes = this.grid.bodyNode.childNodes;
			for(var i = 0; i < this.count; i++){
				callback(nodes[i]);
			}
		}
	}));
});

define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-geometry",
	"../core/_Module"
], function(declare, win, domGeometry, _Module){

	return _Module.register(
	declare(_Module, {

		name: 'autoScroll',

		constructor: function(){
			this.connect(win.doc, 'mousemove', '_onMouseMove');
		},

		getAPIPath: function(){
			return {
				autoScroll: this
			};
		},
	
		//Public ---------------------------------------------------------------------
		enabled: false,

		vertical: true,

		horizontal: true,

		margin: 20,

		//Private ---------------------------------------------------------------------

		_timeout: 100,

		_step: 10,

		_maxMargin: 100,

		_onMouseMove: function(e){
			var t = this;
			if(t.arg('enabled')){
				var d1, d2, g = t.grid, m = t.arg('margin'), 
					pos = domGeometry.position(g.bodyNode);
				if(t.arg('vertical') && g.vScroller){
					d1 = e.clientY - pos.y - m;
					d2 = d1 + 2 * m - pos.h;
					t._vdir = d1 < 0 ? d1 : (d2 > 0 ? d2 : 0);
				}
				if(t.arg('horizontal') && g.hScroller){
					d1 = e.clientX - pos.x - m;
					d2 = d1 + 2 * m - pos.w;
					t._hdir = d1 < 0 ? d1 : (d2 > 0 ? d2 : 0);
				}
				if(!t._handler){
					t._scroll();
				}
			}
		},

		_scroll: function(){
			var t = this;
			if(t.arg('enabled')){
				var dir, a, needScroll, g = t.grid,
					m = t._maxMargin, s = t._step,
					v = t._vdir, h = t._hdir;
				if(t.arg('vertical') && v){
					dir = v > 0 ? 1 : -1;
					a = Math.min(m, Math.abs(v)) / s;
					a = (a < 1 ? 1 : a) * s * dir;
					g.vScroller.domNode.scrollTop += a;
					needScroll = 1;
				}
				if(t.arg('horizontal') && h){
					dir = h > 0 ? 1 : -1;
					a = Math.min(m, Math.abs(h)) / s;
					a = (a < 1 ? 1 : a) * s * dir;
					g.hScroller.domNode.scrollLeft += a;
					needScroll = 1;
				}
				if(needScroll){
					t._handler = setTimeout(function(){
						t._scroll();
					}, t._timeout);
					return;
				}
			}
			delete t._handler;
		}
	}));
});

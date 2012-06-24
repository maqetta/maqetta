define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"./_DataBindingMixin"
], function(array, lang, wb, dbm){
	/*=====
		dbm = dojox.mvc._DataBindingMixin;
		wb = dijit._WidgetBase;
	=====*/

	//Apply the data binding mixin to all dijits, see mixin class description for details
	lang.extend(wb, new dbm());

	// monkey patch dijit._WidgetBase.startup to get data binds set up
	var oldWidgetBaseStartup = wb.prototype.startup;
	wb.prototype.startup = function(){
		this._dbstartup();
		oldWidgetBaseStartup.apply(this);
	};

	// monkey patch dijit._WidgetBase.destroy to remove watches setup in _DataBindingMixin
	var oldWidgetBaseDestroy = wb.prototype.destroy;
	wb.prototype.destroy = function(/*Boolean*/ preserveDom){
		if(this._modelWatchHandles){
			array.forEach(this._modelWatchHandles, function(h){ h.unwatch(); });
		}
		if(this._viewWatchHandles){
			array.forEach(this._viewWatchHandles, function(h){ h.unwatch(); });
		}
		oldWidgetBaseDestroy.apply(this, [preserveDom]);
	};
});

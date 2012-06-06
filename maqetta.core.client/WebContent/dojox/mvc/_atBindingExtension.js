define([
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"./_atBindingMixin",
	"dijit/registry"
], function(lang, _WidgetBase, _atBindingMixin){
	// Apply the at binding mixin to all dijits, see mixin class description for details
	lang.extend(_WidgetBase, _atBindingMixin.prototype);

	// Monkey patch dijit._WidgetBase.postscript to get the list of dojox/mvc/at handles before startup
	var oldWidgetBasePostScript = _WidgetBase.prototype.postscript;
	_WidgetBase.prototype.postscript = function(/*Object?*/ params, /*DomNode|String*/ srcNodeRef){
		this._dbpostscript(params, srcNodeRef);
		oldWidgetBasePostScript.apply(this, lang._toArray(arguments));
	};

	// Monkey patch dijit._WidgetBase.startup to get data binds set up
	var oldWidgetBaseStartup = _WidgetBase.prototype.startup;
	_WidgetBase.prototype.startup = function(){
		this._startAtWatchHandles();
		oldWidgetBaseStartup.apply(this);
	};

	// Monkey patch dijit._WidgetBase.destroy to remove watches setup in _DataBindingMixin
	var oldWidgetBaseDestroy = _WidgetBase.prototype.destroy;
	_WidgetBase.prototype.destroy = function(/*Boolean*/ preserveDom){
		this._stopAtWatchHandles();
		oldWidgetBaseDestroy.apply(this, [preserveDom]);
	};

	// Monkey patch dijit._WidgetBase.set to establish data binding if a dojox/mvc/at handle comes
	var oldWidgetBaseSet = _WidgetBase.prototype.set;
	_WidgetBase.prototype.set = function(/*String*/ name, /*Anything*/ value){
		if(name == _atBindingMixin.prototype.dataBindAttr){
			return this._setBind(value);
		}else if((value || {}).atsignature == "dojox.mvc.at"){
			return this._setAtWatchHandle(name, value);
		}
		return oldWidgetBaseSet.apply(this, lang._toArray(arguments));
	};
});

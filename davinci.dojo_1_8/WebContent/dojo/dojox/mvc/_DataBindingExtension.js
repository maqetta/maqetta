//>>built
define("dojox/mvc/_DataBindingExtension",["dojo/_base/array","dojo/_base/lang","dijit/_WidgetBase","./_DataBindingMixin"],function(_1,_2,_3,_4){
_2.extend(_3,new _4());
var _5=_3.prototype.startup;
_3.prototype.startup=function(){
this._dbstartup();
_5.apply(this);
};
var _6=_3.prototype.destroy;
_3.prototype.destroy=function(_7){
if(this._modelWatchHandles){
_1.forEach(this._modelWatchHandles,function(h){
h.unwatch();
});
}
if(this._viewWatchHandles){
_1.forEach(this._viewWatchHandles,function(h){
h.unwatch();
});
}
_6.apply(this,[_7]);
};
});

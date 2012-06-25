//>>built
define("dojox/mvc/_atBindingExtension",["dojo/_base/lang","dijit/_WidgetBase","./_atBindingMixin","dijit/registry"],function(_1,_2,_3){
_1.extend(_2,_3.prototype);
var _4=_2.prototype.postscript;
_2.prototype.postscript=function(_5,_6){
this._dbpostscript(_5,_6);
_4.apply(this,_1._toArray(arguments));
};
var _7=_2.prototype.startup;
_2.prototype.startup=function(){
this._startAtWatchHandles();
_7.apply(this);
};
var _8=_2.prototype.destroy;
_2.prototype.destroy=function(_9){
this._stopAtWatchHandles();
_8.apply(this,[_9]);
};
var _a=_2.prototype.set;
_2.prototype.set=function(_b,_c){
if(_b==_3.prototype.dataBindAttr){
return this._setBind(_c);
}else{
if((_c||{}).atsignature=="dojox.mvc.at"){
return this._setAtWatchHandle(_b,_c);
}
}
return _a.apply(this,_1._toArray(arguments));
};
});

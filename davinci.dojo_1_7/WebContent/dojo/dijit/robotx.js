//>>built
define("dijit/robotx",["dojo/_base/kernel",".","dojo/_base/lang","./robot","dojo/robotx","dojo/_base/window"],function(_1,_2,_3){
_1.experimental("dijit.robotx");
var _4=doh.robot._updateDocument;
_3.mixin(doh.robot,{_updateDocument:function(){
_4();
var _5=_1.global;
if(_5["dijit"]){
window.dijit=_5.dijit;
}
}});
return _2;
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/TimedMoveable",["../main","./Moveable"],function(_1){
var _2=_1.dnd.Moveable.prototype.onMove;
_1.declare("dojo.dnd.TimedMoveable",_1.dnd.Moveable,{timeout:40,constructor:function(_3,_4){
if(!_4){
_4={};
}
if(_4.timeout&&typeof _4.timeout=="number"&&_4.timeout>=0){
this.timeout=_4.timeout;
}
},markupFactory:function(_5,_6){
return new _1.dnd.TimedMoveable(_6,_5);
},onMoveStop:function(_7){
if(_7._timer){
clearTimeout(_7._timer);
_2.call(this,_7,_7._leftTop);
}
_1.dnd.Moveable.prototype.onMoveStop.apply(this,arguments);
},onMove:function(_8,_9){
_8._leftTop=_9;
if(!_8._timer){
var _a=this;
_8._timer=setTimeout(function(){
_8._timer=null;
_2.call(_a,_8,_8._leftTop);
},this.timeout);
}
}});
return _1.dnd.TimedMoveable;
});

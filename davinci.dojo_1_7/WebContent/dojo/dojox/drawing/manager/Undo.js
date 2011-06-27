/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/Undo",["dojo","../util/oo","./Stencil"],function(_1){
dojox.drawing.manager.Undo=dojox.drawing.util.oo.declare(function(_2){
this.keys=_2.keys;
this.undostack=[];
this.redostack=[];
_1.connect(this.keys,"onKeyDown",this,"onKeyDown");
},{onKeyDown:function(_3){
if(!_3.cmmd){
return;
}
if(_3.keyCode==90&&!_3.shift){
this.undo();
}else{
if((_3.keyCode==90&&_3.shift)||_3.keyCode==89){
this.redo();
}
}
},add:function(_4){
_4.args=_1.mixin({},_4.args);
this.undostack.push(_4);
},apply:function(_5,_6,_7){
_1.hitch(_5,_6)(_7);
},undo:function(){
var o=this.undostack.pop();
if(!o){
return;
}
o.before();
this.redostack.push(o);
},redo:function(){
var o=this.redostack.pop();
if(!o){
return;
}
if(o.after){
o.after();
}else{
o.before();
}
this.undostack.push(o);
}});
return dojox.drawing.manager.Undo;
});

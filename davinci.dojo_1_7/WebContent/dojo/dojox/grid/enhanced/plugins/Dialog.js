/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Dialog",["dojo","dijit","dojox","dojo/window","dijit/Dialog"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins.Dialog",_2.Dialog,{refNode:null,_position:function(){
if(this.refNode&&!this._relativePosition){
var _4=_1.position(_1.byId(this.refNode)),_5=_1.position(this.domNode),_6=_1.window.getBox();
if(_4.x<0){
_4.x=0;
}
if(_4.x+_4.w>_6.w){
_4.w=_6.w-_4.x;
}
if(_4.y<0){
_4.y=0;
}
if(_4.y+_4.h>_6.h){
_4.h=_6.h-_4.y;
}
_4.x=_4.x+_4.w/2-_5.w/2;
_4.y=_4.y+_4.h/2-_5.h/2;
if(_4.x>=0&&_4.x+_5.w<=_6.w&&_4.y>=0&&_4.y+_5.h<=_6.h){
this._relativePosition=_4;
}
}
this.inherited(arguments);
}});
return _3.grid.enhanced.plugins.Dialog;
});

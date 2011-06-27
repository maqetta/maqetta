/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/MenuBar.html"]="<div class=\"dijitMenuBar dijitMenuPassive\" dojoAttachPoint=\"containerNode\"  role=\"menubar\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress: _onKeyPress\"></div>\n";
define("dijit/MenuBar",["dojo/_base/kernel",".","dojo/text!./templates/MenuBar.html","./Menu","dojo/_base/connect","dojo/_base/event"],function(_1,_2,_3){
_1.declare("dijit.MenuBar",_2._MenuBase,{templateString:_3,baseClass:"dijitMenuBar",_isMenuBar:true,postCreate:function(){
var k=_1.keys,l=this.isLeftToRight();
this.connectKeyNavHandlers(l?[k.LEFT_ARROW]:[k.RIGHT_ARROW],l?[k.RIGHT_ARROW]:[k.LEFT_ARROW]);
this._orient=["below"];
},focusChild:function(_4){
var _5=this.focusedChild,_6=_5&&_5.popup&&_5.popup.isShowingNow;
this.inherited(arguments);
if(_6&&_4.popup&&!_4.disabled){
this._openPopup();
}
},_onKeyPress:function(_7){
if(_7.ctrlKey||_7.altKey){
return;
}
switch(_7.charOrCode){
case _1.keys.DOWN_ARROW:
this._moveToPopup(_7);
_1.stopEvent(_7);
}
},onItemClick:function(_8,_9){
if(_8.popup&&_8.popup.isShowingNow){
_8.popup.onCancel();
}else{
this.inherited(arguments);
}
}});
return _2.MenuBar;
});

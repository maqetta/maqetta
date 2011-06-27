/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/LayoutContainer",["dojo/_base/kernel","..","../_WidgetBase","./_LayoutWidget"],function(_1,_2){
_1.declare("dijit.layout.LayoutContainer",_2.layout._LayoutWidget,{baseClass:"dijitLayoutContainer",constructor:function(){
_1.deprecated("dijit.layout.LayoutContainer is deprecated","use BorderContainer instead",2);
},layout:function(){
_2.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
},addChild:function(_3,_4){
this.inherited(arguments);
if(this._started){
_2.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
}
},removeChild:function(_5){
this.inherited(arguments);
if(this._started){
_2.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
}
}});
_1.extend(_2._WidgetBase,{layoutAlign:"none"});
return _2.layout.LayoutContainer;
});

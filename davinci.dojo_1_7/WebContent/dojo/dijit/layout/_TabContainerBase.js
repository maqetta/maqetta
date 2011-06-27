/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/layout/templates/TabContainer.html"]="<div class=\"dijitTabContainer\">\n\t<div class=\"dijitTabListWrapper\" dojoAttachPoint=\"tablistNode\"></div>\n\t<div dojoAttachPoint=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\n\t<div class=\"dijitTabPaneWrapper ${baseClass}-container\" dojoAttachPoint=\"containerNode\"></div>\n</div>\n";
define("dijit/layout/_TabContainerBase",["dojo/_base/kernel","..","dojo/text!./templates/TabContainer.html","./StackContainer","../_TemplatedMixin","dojo/_base/html"],function(_1,_2,_3){
_1.declare("dijit.layout._TabContainerBase",[_2.layout.StackContainer,_2._TemplatedMixin],{tabPosition:"top",baseClass:"dijitTabContainer",tabStrip:false,nested:false,templateString:_3,postMixInProperties:function(){
this.baseClass+=this.tabPosition.charAt(0).toUpperCase()+this.tabPosition.substr(1).replace(/-.*/,"");
this.srcNodeRef&&_1.style(this.srcNodeRef,"visibility","hidden");
this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
this.tablist=this._makeController(this.tablistNode);
if(!this.doLayout){
_1.addClass(this.domNode,"dijitTabContainerNoLayout");
}
if(this.nested){
_1.addClass(this.domNode,"dijitTabContainerNested");
_1.addClass(this.tablist.containerNode,"dijitTabContainerTabListNested");
_1.addClass(this.tablistSpacer,"dijitTabContainerSpacerNested");
_1.addClass(this.containerNode,"dijitTabPaneWrapperNested");
}else{
_1.addClass(this.domNode,"tabStrip-"+(this.tabStrip?"enabled":"disabled"));
}
},_setupChild:function(_4){
_1.addClass(_4.domNode,"dijitTabPane");
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
this.tablist.startup();
this.inherited(arguments);
},layout:function(){
if(!this._contentBox||typeof (this._contentBox.l)=="undefined"){
return;
}
var sc=this.selectedChildWidget;
if(this.doLayout){
var _5=this.tabPosition.replace(/-h/,"");
this.tablist.layoutAlign=_5;
var _6=[this.tablist,{domNode:this.tablistSpacer,layoutAlign:_5},{domNode:this.containerNode,layoutAlign:"client"}];
_2.layout.layoutChildren(this.domNode,this._contentBox,_6);
this._containerContentBox=_2.layout.marginBox2contentBox(this.containerNode,_6[2]);
if(sc&&sc.resize){
sc.resize(this._containerContentBox);
}
}else{
if(this.tablist.resize){
var s=this.tablist.domNode.style;
s.width="0";
var _7=_1.contentBox(this.domNode).w;
s.width="";
this.tablist.resize({w:_7});
}
if(sc&&sc.resize){
sc.resize();
}
}
},destroy:function(){
if(this.tablist){
this.tablist.destroy();
}
this.inherited(arguments);
}});
return _2.layout._TabContainerBase;
});

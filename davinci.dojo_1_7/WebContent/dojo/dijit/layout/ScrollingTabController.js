/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/layout/templates/ScrollingTabController.html"]="<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerMenuButton\"\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\n\t\t\tid=\"${id}_menuBtn\" containerId=\"${containerId}\" iconClass=\"dijitTabStripMenuIcon\"\n\t\t\tdropDownPosition=\"below-alt, above-alt\"\n\t\t\tdojoAttachPoint=\"_menuBtn\" showLabel=\"false\" title=\"\">&#9660;</div>\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\"\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\n\t\t\tid=\"${id}_leftBtn\" iconClass=\"dijitTabStripSlideLeftIcon\"\n\t\t\tdojoAttachPoint=\"_leftBtn\" dojoAttachEvent=\"onClick: doSlideLeft\" showLabel=\"false\" title=\"\">&#9664;</div>\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\"\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\n\t\t\tid=\"${id}_rightBtn\" iconClass=\"dijitTabStripSlideRightIcon\"\n\t\t\tdojoAttachPoint=\"_rightBtn\" dojoAttachEvent=\"onClick: doSlideRight\" showLabel=\"false\" title=\"\">&#9654;</div>\n\t<div class='dijitTabListWrapper' dojoAttachPoint='tablistWrapper'>\n\t\t<div role='tablist' dojoAttachEvent='onkeypress:onkeypress'\n\t\t\t\tdojoAttachPoint='containerNode' class='nowrapTabStrip'></div>\n\t</div>\n</div>";
require.cache["dijit/layout/templates/_ScrollingTabControllerButton.html"]="<div dojoAttachEvent=\"onclick:_onClick\">\n\t<div role=\"presentation\" class=\"dijitTabInnerDiv\" dojoattachpoint=\"innerDiv,focusNode\">\n\t\t<div role=\"presentation\" class=\"dijitTabContent dijitButtonContents\" dojoattachpoint=\"tabContent\">\n\t\t\t<img role=\"presentation\" alt=\"\" src=\"${_blankGif}\" class=\"dijitTabStripIcon\" dojoAttachPoint=\"iconNode\"/>\n\t\t\t<span dojoAttachPoint=\"containerNode,titleNode\" class=\"dijitButtonText\"></span>\n\t\t</div>\n\t</div>\n</div>";
define("dijit/layout/ScrollingTabController",["dojo/_base/kernel","..","dojo/text!./templates/ScrollingTabController.html","dojo/text!./templates/_ScrollingTabControllerButton.html","./TabController","../_WidgetsInTemplateMixin","../Menu","../form/Button","../_HasDropDown","dojo/_base/NodeList","dojo/_base/array","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/fx","dojo/query"],function(_1,_2,_3,_4){
_1.declare("dijit.layout.ScrollingTabController",[_2.layout.TabController,_2._WidgetsInTemplateMixin],{baseClass:"dijitTabController dijitScrollingTabController",templateString:_3,useMenu:true,useSlider:true,tabStripClass:"",widgetsInTemplate:true,_minScroll:5,_setClassAttr:{node:"containerNode",type:"class"},buildRendering:function(){
this.inherited(arguments);
var n=this.domNode;
this.scrollNode=this.tablistWrapper;
this._initButtons();
if(!this.tabStripClass){
this.tabStripClass="dijitTabContainer"+this.tabPosition.charAt(0).toUpperCase()+this.tabPosition.substr(1).replace(/-.*/,"")+"None";
_1.addClass(n,"tabStrip-disabled");
}
_1.addClass(this.tablistWrapper,this.tabStripClass);
},onStartup:function(){
this.inherited(arguments);
_1.style(this.domNode,"visibility","visible");
this._postStartup=true;
},onAddChild:function(_5,_6){
this.inherited(arguments);
_1.forEach(["label","iconClass"],function(_7){
this.pane2watches[_5.id].push(this.pane2button[_5.id].watch(_7,_1.hitch(this,function(_8,_9,_a){
if(this._postStartup&&this._dim){
this.resize(this._dim);
}
})));
},this);
_1.style(this.containerNode,"width",(_1.style(this.containerNode,"width")+200)+"px");
},onRemoveChild:function(_b,_c){
var _d=this.pane2button[_b.id];
if(this._selectedTab===_d.domNode){
this._selectedTab=null;
}
this.inherited(arguments);
},_initButtons:function(){
this._btnWidth=0;
this._buttons=_1.query("> .tabStripButton",this.domNode).filter(function(_e){
if((this.useMenu&&_e==this._menuBtn.domNode)||(this.useSlider&&(_e==this._rightBtn.domNode||_e==this._leftBtn.domNode))){
this._btnWidth+=_1._getMarginSize(_e).w;
return true;
}else{
_1.style(_e,"display","none");
return false;
}
},this);
},_getTabsWidth:function(){
var _f=this.getChildren();
if(_f.length){
var _10=_f[this.isLeftToRight()?0:_f.length-1].domNode,_11=_f[this.isLeftToRight()?_f.length-1:0].domNode;
return _11.offsetLeft+_1.style(_11,"width")-_10.offsetLeft;
}else{
return 0;
}
},_enableBtn:function(_12){
var _13=this._getTabsWidth();
_12=_12||_1.style(this.scrollNode,"width");
return _13>0&&_12<_13;
},resize:function(dim){
this._dim=dim;
this.scrollNode.style.height="auto";
this._contentBox=_2.layout.marginBox2contentBox(this.domNode,{h:0,w:dim.w});
this._contentBox.h=this.scrollNode.offsetHeight;
_1.contentBox(this.domNode,this._contentBox);
var _14=this._enableBtn(this._contentBox.w);
this._buttons.style("display",_14?"":"none");
this._leftBtn.layoutAlign="left";
this._rightBtn.layoutAlign="right";
this._menuBtn.layoutAlign=this.isLeftToRight()?"right":"left";
_2.layout.layoutChildren(this.domNode,this._contentBox,[this._menuBtn,this._leftBtn,this._rightBtn,{domNode:this.scrollNode,layoutAlign:"client"}]);
if(this._selectedTab){
if(this._anim&&this._anim.status()=="playing"){
this._anim.stop();
}
this.scrollNode.scrollLeft=this._convertToScrollLeft(this._getScrollForSelectedTab());
}
this._setButtonClass(this._getScroll());
this._postResize=true;
return {h:this._contentBox.h,w:dim.w};
},_getScroll:function(){
return (this.isLeftToRight()||_1.isIE<8||(_1.isIE&&_1.isQuirks)||_1.isWebKit)?this.scrollNode.scrollLeft:_1.style(this.containerNode,"width")-_1.style(this.scrollNode,"width")+(_1.isIE==8?-1:1)*this.scrollNode.scrollLeft;
},_convertToScrollLeft:function(val){
if(this.isLeftToRight()||_1.isIE<8||(_1.isIE&&_1.isQuirks)||_1.isWebKit){
return val;
}else{
var _15=_1.style(this.containerNode,"width")-_1.style(this.scrollNode,"width");
return (_1.isIE==8?-1:1)*(val-_15);
}
},onSelectChild:function(_16){
var tab=this.pane2button[_16.id];
if(!tab||!_16){
return;
}
var _17=tab.domNode;
if(_17!=this._selectedTab){
this._selectedTab=_17;
if(this._postResize){
var sl=this._getScroll();
if(sl>_17.offsetLeft||sl+_1.style(this.scrollNode,"width")<_17.offsetLeft+_1.style(_17,"width")){
this.createSmoothScroll().play();
}
}
}
this.inherited(arguments);
},_getScrollBounds:function(){
var _18=this.getChildren(),_19=_1.style(this.scrollNode,"width"),_1a=_1.style(this.containerNode,"width"),_1b=_1a-_19,_1c=this._getTabsWidth();
if(_18.length&&_1c>_19){
return {min:this.isLeftToRight()?0:_18[_18.length-1].domNode.offsetLeft,max:this.isLeftToRight()?(_18[_18.length-1].domNode.offsetLeft+_1.style(_18[_18.length-1].domNode,"width"))-_19:_1b};
}else{
var _1d=this.isLeftToRight()?0:_1b;
return {min:_1d,max:_1d};
}
},_getScrollForSelectedTab:function(){
var w=this.scrollNode,n=this._selectedTab,_1e=_1.style(this.scrollNode,"width"),_1f=this._getScrollBounds();
var pos=(n.offsetLeft+_1.style(n,"width")/2)-_1e/2;
pos=Math.min(Math.max(pos,_1f.min),_1f.max);
return pos;
},createSmoothScroll:function(x){
if(arguments.length>0){
var _20=this._getScrollBounds();
x=Math.min(Math.max(x,_20.min),_20.max);
}else{
x=this._getScrollForSelectedTab();
}
if(this._anim&&this._anim.status()=="playing"){
this._anim.stop();
}
var _21=this,w=this.scrollNode,_22=new _1._Animation({beforeBegin:function(){
if(this.curve){
delete this.curve;
}
var _23=w.scrollLeft,_24=_21._convertToScrollLeft(x);
_22.curve=new _1._Line(_23,_24);
},onAnimate:function(val){
w.scrollLeft=val;
}});
this._anim=_22;
this._setButtonClass(x);
return _22;
},_getBtnNode:function(e){
var n=e.target;
while(n&&!_1.hasClass(n,"tabStripButton")){
n=n.parentNode;
}
return n;
},doSlideRight:function(e){
this.doSlide(1,this._getBtnNode(e));
},doSlideLeft:function(e){
this.doSlide(-1,this._getBtnNode(e));
},doSlide:function(_25,_26){
if(_26&&_1.hasClass(_26,"dijitTabDisabled")){
return;
}
var _27=_1.style(this.scrollNode,"width");
var d=(_27*0.75)*_25;
var to=this._getScroll()+d;
this._setButtonClass(to);
this.createSmoothScroll(to).play();
},_setButtonClass:function(_28){
var _29=this._getScrollBounds();
this._leftBtn.set("disabled",_28<=_29.min);
this._rightBtn.set("disabled",_28>=_29.max);
}});
_1.declare("dijit.layout._ScrollingTabControllerButtonMixin",null,{baseClass:"dijitTab tabStripButton",templateString:_4,tabIndex:"",isFocusable:function(){
return false;
}});
_1.declare("dijit.layout._ScrollingTabControllerButton",[_2.form.Button,_2.layout._ScrollingTabControllerButtonMixin]);
_1.declare("dijit.layout._ScrollingTabControllerMenuButton",[_2.form.Button,_2._HasDropDown,_2.layout._ScrollingTabControllerButtonMixin],{containerId:"",tabIndex:"-1",isLoaded:function(){
return false;
},loadDropDown:function(_2a){
this.dropDown=new _2.Menu({id:this.containerId+"_menu",dir:this.dir,lang:this.lang,textDir:this.textDir});
var _2b=_2.byId(this.containerId);
_1.forEach(_2b.getChildren(),function(_2c){
var _2d=new _2.MenuItem({id:_2c.id+"_stcMi",label:_2c.title,iconClass:_2c.iconClass,dir:_2c.dir,lang:_2c.lang,textDir:_2c.textDir,onClick:function(){
_2b.selectChild(_2c);
}});
this.dropDown.addChild(_2d);
},this);
_2a();
},closeDropDown:function(_2e){
this.inherited(arguments);
if(this.dropDown){
this.dropDown.destroyRecursive();
delete this.dropDown;
}
}});
return _2.layout.ScrollingTabController;
});

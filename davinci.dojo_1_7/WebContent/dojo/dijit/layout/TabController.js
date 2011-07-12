/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/layout/templates/_TabButton.html"]="<div role=\"presentation\" dojoAttachPoint=\"titleNode\" dojoAttachEvent='onclick:onClick'>\n    <div role=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\n        <div role=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\n        \t<div role=\"presentation\" dojoAttachPoint='focusNode'>\n\t\t        <img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitTabButtonIcon\" dojoAttachPoint='iconNode' />\n\t\t        <span dojoAttachPoint='containerNode' class='tabLabel'></span>\n\t\t        <span class=\"dijitInline dijitTabCloseButton dijitTabCloseIcon\" dojoAttachPoint='closeNode'\n\t\t        \t\tdojoAttachEvent='onclick: onClickCloseButton' role=\"presentation\">\n\t\t            <span dojoAttachPoint='closeText' class='dijitTabCloseText'>[x]</span\n\t\t        ></span>\n\t\t\t</div>\n        </div>\n    </div>\n</div>\n";
define("dijit/layout/TabController",["dojo/_base/kernel","..","dojo/text!./templates/_TabButton.html","./StackController","../Menu","../MenuItem","dojo/i18n!../nls/common","dojo/_base/html","dojo/_base/lang","dojo/i18n"],function(_1,_2,_3){
_1.declare("dijit.layout.TabController",_2.layout.StackController,{baseClass:"dijitTabController",templateString:"<div role='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",tabPosition:"top",buttonWidget:"dijit.layout._TabButton",_rectifyRtlTabList:function(){
if(0>=this.tabPosition.indexOf("-h")){
return;
}
if(!this.pane2button){
return;
}
var _4=0;
for(var _5 in this.pane2button){
var ow=this.pane2button[_5].innerDiv.scrollWidth;
_4=Math.max(_4,ow);
}
for(_5 in this.pane2button){
this.pane2button[_5].innerDiv.style.width=_4+"px";
}
}});
_1.declare("dijit.layout._TabButton",_2.layout._StackButton,{baseClass:"dijitTab",cssStateNodes:{closeNode:"dijitTabCloseButton"},templateString:_3,scrollOnFocus:false,buildRendering:function(){
this.inherited(arguments);
_1.setSelectable(this.containerNode,false);
},startup:function(){
this.inherited(arguments);
var n=this.domNode;
setTimeout(function(){
n.className=n.className;
},1);
},_setCloseButtonAttr:function(_6){
this._set("closeButton",_6);
_1.toggleClass(this.innerDiv,"dijitClosable",_6);
this.closeNode.style.display=_6?"":"none";
if(_6){
var _7=_1.i18n.getLocalization("dijit","common");
if(this.closeNode){
_1.attr(this.closeNode,"title",_7.itemClose);
}
var _7=_1.i18n.getLocalization("dijit","common");
this._closeMenu=new _2.Menu({id:this.id+"_Menu",dir:this.dir,lang:this.lang,textDir:this.textDir,targetNodeIds:[this.domNode]});
this._closeMenu.addChild(new _2.MenuItem({label:_7.itemClose,dir:this.dir,lang:this.lang,textDir:this.textDir,onClick:_1.hitch(this,"onClickCloseButton")}));
}else{
if(this._closeMenu){
this._closeMenu.destroyRecursive();
delete this._closeMenu;
}
}
},_setLabelAttr:function(_8){
this.inherited(arguments);
if(!this.showLabel&&!this.params.title){
this.iconNode.alt=_1.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
},destroy:function(){
if(this._closeMenu){
this._closeMenu.destroyRecursive();
delete this._closeMenu;
}
this.inherited(arguments);
}});
return _2.layout.TabController;
});

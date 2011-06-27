/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/TabContainer",["dojo/_base/kernel","..","./_TabContainerBase","./TabController","./ScrollingTabController","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit.layout.TabContainer",_2.layout._TabContainerBase,{useMenu:true,useSlider:true,controllerWidget:"",_makeController:function(_3){
var _4=this.baseClass+"-tabs"+(this.doLayout?"":" dijitTabNoLayout"),_5=_1.getObject(this.controllerWidget);
return new _5({id:this.id+"_tablist",dir:this.dir,lang:this.lang,textDir:this.textDir,tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id,"class":_4,nested:this.nested,useMenu:this.useMenu,useSlider:this.useSlider,tabStripClass:this.tabStrip?this.baseClass+(this.tabStrip?"":"No")+"Strip":null},_3);
},postMixInProperties:function(){
this.inherited(arguments);
if(!this.controllerWidget){
this.controllerWidget=(this.tabPosition=="top"||this.tabPosition=="bottom")&&!this.nested?"dijit.layout.ScrollingTabController":"dijit.layout.TabController";
}
}});
return _2.layout.TabContainer;
});

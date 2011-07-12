/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Opener",["./Tooltip","./Overlay","./common"],function(_1,_2,_3){
var _4=dojo.declare("dojox.mobile.Opener",dojo.hasClass(dojo.doc.documentElement,"dj_phone")?dojox.mobile.Overlay:dojox.mobile.Tooltip,{onShow:function(_5){
},onHide:function(_6,v){
},show:function(_7,_8){
this.node=_7;
this.onShow(_7);
if(!this.cover){
this.cover=dojo.create("div",{style:{position:"absolute",top:"0px",left:"0px",width:"100%",height:"100%",backgroundColor:"transparent"}},this.domNode,"before");
this.connect(this.cover,"onclick","_onBlur");
}
dojo.style(this.cover,"visibility","visible");
return this.inherited(arguments);
},hide:function(_9){
dojo.style(this.cover,"visibility","hidden");
this.inherited(arguments);
this.onHide(this.node,_9);
},_onBlur:function(e){
if(this.onBlur(e)!==false){
this.hide(e);
}
},destroy:function(){
this.inherited(arguments);
dojo.destroy(this.cover);
}});
_4.prototype.baseClass+=" mblOpener";
return _4;
});

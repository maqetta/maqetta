/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/DynamicTooltip",["dojo","dijit","dojox","dijit/Tooltip","dojo/i18n","dijit/nls/loading"],function(_1,_2,_3){
_1.getObject("dojox.widget.DynamicTooltip",1);
_1.experimental("dojox.widget.DynamicTooltip");
_1.requireLocalization("dijit","loading");
_1.declare("dojox.widget.DynamicTooltip",_2.Tooltip,{hasLoaded:false,href:"",label:"",preventCache:false,postMixInProperties:function(){
this.inherited(arguments);
this._setLoadingLabel();
},_setLoadingLabel:function(){
if(this.href){
this.label=_1.i18n.getLocalization("dijit","loading",this.lang).loadingState;
}
},_setHrefAttr:function(_4){
this.href=_4;
this.hasLoaded=false;
},loadContent:function(_5){
if(!this.hasLoaded&&this.href){
this._setLoadingLabel();
this.hasLoaded=true;
_1.xhrGet({url:this.href,handleAs:"text",tooltipWidget:this,load:function(_6,_7){
this.tooltipWidget.label=_6;
this.tooltipWidget.close();
this.tooltipWidget.open(_5);
},preventCache:this.preventCache});
}
},refresh:function(){
this.hasLoaded=false;
},open:function(_8){
_8=_8||(this._connectNodes&&this._connectNodes[0]);
if(!_8){
return;
}
this.loadContent(_8);
this.inherited(arguments);
}});
return _1.getObject("dojox.widget.DynamicTooltip");
});
require(["dojox/widget/DynamicTooltip"]);

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

require.cache["dijit/templates/ProgressBar.html"]="<div class=\"dijitProgressBar dijitProgressBarEmpty\" role=\"progressbar\"\n\t><div  dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\n\t\t><div class=\"dijitProgressBarTile\" role=\"presentation\"></div\n\t\t><span style=\"visibility:hidden\">&nbsp;</span\n\t></div\n\t><div dojoAttachPoint=\"labelNode\" class=\"dijitProgressBarLabel\" id=\"${id}_label\"></div\n\t><img dojoAttachPoint=\"indeterminateHighContrastImage\" class=\"dijitProgressBarIndeterminateHighContrastImage\" alt=\"\"\n/></div>\n";
define("dijit/ProgressBar",["dojo/_base/kernel",".","dojo/text!./templates/ProgressBar.html","dojo/number","./_Widget","./_TemplatedMixin","dojo/_base/html","dojo/_base/url"],function(_1,_2,_3){
_1.declare("dijit.ProgressBar",[_2._Widget,_2._TemplatedMixin],{progress:"0",value:"",maximum:100,places:0,indeterminate:false,label:"",name:"",templateString:_3,_indeterminateHighContrastImagePath:_1.moduleUrl("dijit","themes/a11y/indeterminate_progress.gif"),postMixInProperties:function(){
this.inherited(arguments);
if(!("value" in this.params)){
this.value=this.indeterminate?Infinity:this.progress;
}
},buildRendering:function(){
this.inherited(arguments);
this.indeterminateHighContrastImage.setAttribute("src",this._indeterminateHighContrastImagePath.toString());
this.update();
},update:function(_4){
_1.mixin(this,_4||{});
var _5=this.internalProgress,ap=this.domNode;
var _6=1;
if(this.indeterminate){
ap.removeAttribute("aria-valuenow");
ap.removeAttribute("aria-valuemin");
ap.removeAttribute("aria-valuemax");
}else{
if(String(this.progress).indexOf("%")!=-1){
_6=Math.min(parseFloat(this.progress)/100,1);
this.progress=_6*this.maximum;
}else{
this.progress=Math.min(this.progress,this.maximum);
_6=this.maximum?this.progress/this.maximum:0;
}
ap.setAttribute("aria-describedby",this.labelNode.id);
ap.setAttribute("aria-valuenow",this.progress);
ap.setAttribute("aria-valuemin",0);
ap.setAttribute("aria-valuemax",this.maximum);
}
this.labelNode.innerHTML=this.report(_6);
_1.toggleClass(this.domNode,"dijitProgressBarIndeterminate",this.indeterminate);
_5.style.width=(_6*100)+"%";
this.onChange();
},_setValueAttr:function(v){
this._set("value",v);
if(v==Infinity){
this.update({indeterminate:true});
}else{
this.update({indeterminate:false,progress:v});
}
},_setLabelAttr:function(_7){
this._set("label",_7);
this.update();
},_setIndeterminateAttr:function(_8){
this.indeterminate=_8;
this.update();
},report:function(_9){
return this.label?this.label:(this.indeterminate?"&nbsp;":_1.number.format(_9,{type:"percent",places:this.places,locale:this.lang}));
},onChange:function(){
}});
return _2.ProgressBar;
});

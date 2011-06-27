/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/HorizontalRuleLabels",["dojo/_base/kernel","..","./HorizontalRule","dojo/_base/NodeList","dojo/number","dojo/query"],function(_1,_2){
_1.declare("dijit.form.HorizontalRuleLabels",_2.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH dijitRuleLabelsContainer dijitRuleLabelsContainerH\"></div>",labelStyle:"",labels:[],numericMargin:0,minimum:0,maximum:1,constraints:{pattern:"#%"},_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:",_labelPrefix:"\"><div class=\"dijitRuleLabel dijitRuleLabelH\">",_suffix:"</div></div>",_calcPosition:function(_3){
return _3;
},_genHTML:function(_4,_5){
return this._positionPrefix+this._calcPosition(_4)+this._positionSuffix+this.labelStyle+this._labelPrefix+this.labels[_5]+this._suffix;
},getLabels:function(){
var _6=this.labels;
if(!_6.length){
_6=_1.query("> li",this.srcNodeRef).map(function(_7){
return String(_7.innerHTML);
});
}
this.srcNodeRef.innerHTML="";
if(!_6.length&&this.count>1){
var _8=this.minimum;
var _9=(this.maximum-_8)/(this.count-1);
for(var i=0;i<this.count;i++){
_6.push((i<this.numericMargin||i>=(this.count-this.numericMargin))?"":_1.number.format(_8,this.constraints));
_8+=_9;
}
}
return _6;
},postMixInProperties:function(){
this.inherited(arguments);
this.labels=this.getLabels();
this.count=this.labels.length;
}});
return _2.form.HorizontalRuleLabels;
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/VerticalRuleLabels",["dojo/_base/kernel","..","./HorizontalRuleLabels","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit.form.VerticalRuleLabels",_2.form.HorizontalRuleLabels,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV dijitRuleLabelsContainer dijitRuleLabelsContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerV\" style=\"top:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelV\">",_calcPosition:function(_3){
return 100-_3;
},_isHorizontal:false});
return _2.form.VerticalRuleLabels;
});

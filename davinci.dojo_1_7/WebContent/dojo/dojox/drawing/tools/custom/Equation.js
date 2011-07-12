/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/tools/custom/Equation",["../../util/oo","../TextBlock"],function(){
dojox.drawing.tools.custom.Equation=dojox.drawing.util.oo.declare(dojox.drawing.tools.TextBlock,function(_1){
},{customType:"equation"});
dojox.drawing.tools.custom.Equation.setup={name:"dojox.drawing.tools.custom.Equation",tooltip:"Equation Tool",iconClass:"iconEq"};
dojox.drawing.register(dojox.drawing.tools.custom.Equation.setup,"tool");
return dojox.drawing.tools.custom.Equation;
});

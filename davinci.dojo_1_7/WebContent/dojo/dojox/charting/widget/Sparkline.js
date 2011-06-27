/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/widget/Sparkline",["dojo/_base/kernel","dojo/_base/array","dojo/_base/declare","dojo/_base/html","dojo/query","./Chart","../themes/GreySkies","../plot2d/Lines"],function(_1,_2,_3,_4,_5,_6,_7,_8){
var d=_1;
_1.declare("dojox.charting.widget.Sparkline",dojox.charting.widget.Chart,{theme:_7,margins:{l:0,r:0,t:0,b:0},type:"Lines",valueFn:"Number(x)",store:"",field:"",query:"",queryOptions:"",start:"0",count:"Infinity",sort:"",data:"",name:"default",buildRendering:function(){
var n=this.srcNodeRef;
if(!n.childNodes.length||!d.query("> .axis, > .plot, > .action, > .series",n).length){
var _9=document.createElement("div");
d.attr(_9,{"class":"plot","name":"default","type":this.type});
n.appendChild(_9);
var _a=document.createElement("div");
d.attr(_a,{"class":"series",plot:"default",name:this.name,start:this.start,count:this.count,valueFn:this.valueFn});
d.forEach(["store","field","query","queryOptions","sort","data"],function(i){
if(this[i].length){
d.attr(_a,i,this[i]);
}
},this);
n.appendChild(_a);
}
this.inherited(arguments);
}});
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Printer",["dojo","dijit","dojox","../_Plugin","./exporter/TableWriter","dojo/DeferredList"],function(_1){
_1.declare("dojox.grid.enhanced.plugins.Printer",dojox.grid.enhanced._Plugin,{name:"printer",constructor:function(_2){
this.grid=_2;
this._mixinGrid(_2);
_2.setExportFormatter(function(_3,_4,_5,_6){
return _4.format(_5,_6);
});
},_mixinGrid:function(){
var g=this.grid;
g.printGrid=_1.hitch(this,this.printGrid);
g.printSelected=_1.hitch(this,this.printSelected);
g.exportToHTML=_1.hitch(this,this.exportToHTML);
g.exportSelectedToHTML=_1.hitch(this,this.exportSelectedToHTML);
g.normalizePrintedGrid=_1.hitch(this,this.normalizeRowHeight);
},printGrid:function(_7){
this.exportToHTML(_7,_1.hitch(this,this._print));
},printSelected:function(_8){
this.exportSelectedToHTML(_8,_1.hitch(this,this._print));
},exportToHTML:function(_9,_a){
_9=this._formalizeArgs(_9);
var _b=this;
this.grid.exportGrid("table",_9,function(_c){
_b._wrapHTML(_9.title,_9.cssFiles,_9.titleInBody+_c).then(_a);
});
},exportSelectedToHTML:function(_d,_e){
_d=this._formalizeArgs(_d);
var _f=this;
this.grid.exportSelected("table",_d.writerArgs,function(str){
_f._wrapHTML(_d.title,_d.cssFiles,_d.titleInBody+str).then(_e);
});
},_loadCSSFiles:function(_10){
var dl=_1.map(_10,function(_11){
_11=_1.trim(_11);
if(_11.substring(_11.length-4).toLowerCase()===".css"){
return _1.xhrGet({url:_11});
}else{
var d=new _1.Deferred();
d.callback(_11);
return d;
}
});
return _1.DeferredList.prototype.gatherResults(dl);
},_print:function(_12){
var win,_13=this,_14=function(w){
var doc=w.document;
doc.open();
doc.write(_12);
doc.close();
_13.normalizeRowHeight(doc);
};
if(!window.print){
return;
}else{
if(_1.isChrome||_1.isOpera){
win=window.open("javascript: ''","","status=0,menubar=0,location=0,toolbar=0,width=1,height=1,resizable=0,scrollbars=0");
_14(win);
win.print();
win.close();
}else{
var fn=this._printFrame,dn=this.grid.domNode;
if(!fn){
var _15=dn.id+"_print_frame";
if(!(fn=_1.byId(_15))){
fn=_1.create("iframe");
fn.id=_15;
fn.frameBorder=0;
_1.style(fn,{width:"1px",height:"1px",position:"absolute",right:0,bottom:0,border:"none",overflow:"hidden"});
if(!_1.isIE){
_1.style(fn,"visibility","hidden");
}
dn.appendChild(fn);
}
this._printFrame=fn;
}
win=fn.contentWindow;
_14(win);
win.focus();
win.print();
}
}
},_wrapHTML:function(_16,_17,_18){
return this._loadCSSFiles(_17).then(function(_19){
var i,_1a=["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">","<html ",_1._isBodyLtr()?"":"dir=\"rtl\"","><head><title>",_16,"</title><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></meta>"];
for(i=0;i<_19.length;++i){
_1a.push("<style type=\"text/css\">",_19[i],"</style>");
}
_1a.push("</head>");
if(_18.search(/^\s*<body/i)<0){
_18="<body>"+_18+"</body>";
}
_1a.push(_18,"</html>");
return _1a.join("");
});
},normalizeRowHeight:function(doc){
var _1b=_1.query(".grid_view",doc.body);
var _1c=_1.map(_1b,function(_1d){
return _1.query(".grid_header",_1d)[0];
});
var _1e=_1.map(_1b,function(_1f){
return _1.query(".grid_row",_1f);
});
var _20=_1e[0].length;
var i,v,h,_21=0;
for(v=_1b.length-1;v>=0;--v){
h=_1.contentBox(_1c[v]).h;
if(h>_21){
_21=h;
}
}
for(v=_1b.length-1;v>=0;--v){
_1.style(_1c[v],"height",_21+"px");
}
for(i=0;i<_20;++i){
_21=0;
for(v=_1b.length-1;v>=0;--v){
h=_1.contentBox(_1e[v][i]).h;
if(h>_21){
_21=h;
}
}
for(v=_1b.length-1;v>=0;--v){
_1.style(_1e[v][i],"height",_21+"px");
}
}
var _22=0,ltr=_1._isBodyLtr();
for(v=0;v<_1b.length;++v){
_1.style(_1b[v],ltr?"left":"right",_22+"px");
_22+=_1.marginBox(_1b[v]).w;
}
},_formalizeArgs:function(_23){
_23=(_23&&_1.isObject(_23))?_23:{};
_23.title=String(_23.title)||"";
if(!_1.isArray(_23.cssFiles)){
_23.cssFiles=[_23.cssFiles];
}
_23.titleInBody=_23.title?["<h1>",_23.title,"</h1>"].join(""):"";
return _23;
}});
dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Printer,{"dependency":["exporter"]});
return dojox.grid.enhanced.plugins.Printer;
});

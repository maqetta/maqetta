/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","../_Plugin","./exporter/TableWriter","dijit/focus"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins.Printer",_3.grid.enhanced._Plugin,{name:"printer",constructor:function(_4){
this.grid=_4;
this._mixinGrid(_4);
_4.setExportFormatter(function(_5,_6,_7,_8){
return _6.format(_7,_8);
});
},_mixinGrid:function(){
var g=this.grid;
g.printGrid=_1.hitch(this,this.printGrid);
g.printSelected=_1.hitch(this,this.printSelected);
g.exportToHTML=_1.hitch(this,this.exportToHTML);
g.exportSelectedToHTML=_1.hitch(this,this.exportSelectedToHTML);
g.normalizePrintedGrid=_1.hitch(this,this.normalizeRowHeight);
},printGrid:function(_9){
this.exportToHTML(_9,_1.hitch(this,this._print));
},printSelected:function(_a){
this._print(this.exportSelectedToHTML(_a));
},exportToHTML:function(_b,_c){
_b=this._formalizeArgs(_b);
var _d=this;
this.grid.exportGrid("table",_b,function(_e){
_c(_d._wrapHTML(_b.title,_b.cssFiles,_b.titleInBody+_e));
});
},exportSelectedToHTML:function(_f){
_f=this._formalizeArgs(_f);
var str=this.grid.exportSelected("table",_f.writerArgs);
return this._wrapHTML(_f.title,_f.cssFiles,_f.titleInBody+str);
},_print:function(_10){
var win,_11=this,_12=function(w){
var doc=win.document;
doc.open();
doc.write(_10);
doc.close();
_11.normalizeRowHeight(doc);
};
if(!window.print){
return;
}else{
if(_1.isChrome||_1.isOpera){
win=window.open("javascript: ''","","status=0,menubar=0,location=0,toolbar=0,width=1,height=1,resizable=0,scrollbars=0");
_12(win);
win.print();
win.close();
}else{
var fn=this._printFrame,dn=this.grid.domNode;
if(!fn){
var _13=dn.id+"_print_frame";
if(!(fn=_1.byId(_13))){
fn=_1.create("iframe");
fn.id=_13;
fn.frameBorder=0;
_1.style(fn,{width:"1px",height:"1px",position:"absolute",right:0,bottoom:0,border:"none",overflow:"hidden"});
if(!_1.isIE){
_1.style(fn,"visibility","hidden");
}
dn.appendChild(fn);
}
this._printFrame=fn;
}
win=fn.contentWindow;
_12(win);
_2.focus(fn);
win.print();
}
}
},_wrapHTML:function(_14,_15,_16){
var _17=["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">","<html><head><title>",_14,"</title><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></meta>"];
for(var i=0;i<_15.length;++i){
_17.push("<link rel=\"stylesheet\" type=\"text/css\" href=\""+_15[i]+"\" />");
}
_17.push("</head>");
if(_16.search(/^\s*<body/i)<0){
_16="<body>"+_16+"</body>";
}
_17.push(_16);
return _17.join("\n");
},normalizeRowHeight:function(doc){
var _18=_1.query("table.grid_view",doc.body);
var _19=_1.map(_18,function(_1a){
return _1.query("thead.grid_header",_1a)[0];
});
var _1b=_1.map(_18,function(_1c){
return _1.query("tbody.grid_row",_1c);
});
var _1d=_1b[0].length;
var i,v,h,_1e=0;
for(v=_18.length-1;v>=0;--v){
h=_1.contentBox(_19[v]).h;
if(h>_1e){
_1e=h;
}
}
for(v=_18.length-1;v>=0;--v){
_1.style(_19[v],"height",_1e+"px");
}
for(i=0;i<_1d;++i){
_1e=0;
for(v=_18.length-1;v>=0;--v){
h=_1.contentBox(_1b[v][i]).h;
if(h>_1e){
_1e=h;
}
}
for(v=_18.length-1;v>=0;--v){
_1.style(_1b[v][i],"height",_1e+"px");
}
}
var _1f=0;
for(v=0;v<_18.length;++v){
_1.style(_18[v],"left",_1f+"px");
_1f+=_1.marginBox(_18[v]).w;
}
},_formalizeArgs:function(_20){
_20=(_20&&_1.isObject(_20))?_20:{};
_20.title=String(_20.title)||"";
if(!_1.isArray(_20.cssFiles)){
_20.cssFiles=[_20.cssFiles];
}
_20.titleInBody=_20.title?["<h1>",_20.title,"</h1>"].join(""):"";
return _20;
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.Printer,{"dependency":["exporter"]});
return _3.grid.enhanced.plugins.Printer;
});

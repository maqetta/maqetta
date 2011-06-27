/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
var fs=require("fs");
var path=require("path");
var less=require("less");
var folders=["../android","../blackberry","../iphone","../custom"];
var files=[];
folders.forEach(function(_1){
files=files.concat(fs.readdirSync(_1).map(function(_2){
return _1+"/"+_2;
}));
});
files=files.filter(function(_3){
return _3&&/\.less$/.test(_3)&&!/variables\.less$/.test(_3);
});
files.forEach(function(_4){
fs.readFile(_4,"utf-8",function(_5,_6){
if(_5){
console.error(_5.message);
process.exit(1);
}
var _7=new (less.Parser)({paths:[path.dirname(_4)],filename:_4,optimization:1});
_7.parse(_6,function(_8,_9){
if(_8){
less.writeError(_8);
process.exit(1);
}
try{
var _a=_9.toCSS({compress:false});
var fd=fs.openSync(_4.replace(".less",".css"),"w");
fs.writeSync(fd,_a,0,"utf-8");
}
catch(_8){
less.writeError(_8);
process.exit(2);
}
});
});
});

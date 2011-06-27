/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/dom",["dojo","dojox","dojox/xml/parser"],function(_1,_2){
_1.deprecated("dojox.data.dom","Use dojox.xml.parser instead.","2.0");
if(!_2.data){
_2.data={};
}
if(!_2.data.dom){
_2.data.dom={};
}
_2.data.dom.createDocument=function(_3,_4){
_1.deprecated("dojox.data.dom.createDocument()","Use dojox.xml.parser.parse() instead.","2.0");
try{
return _2.xml.parser.parse(_3,_4);
}
catch(e){
return null;
}
};
_2.data.dom.textContent=function(_5,_6){
_1.deprecated("dojox.data.dom.textContent()","Use dojox.xml.parser.textContent() instead.","2.0");
if(arguments.length>1){
return _2.xml.parser.textContent(_5,_6);
}else{
return _2.xml.parser.textContent(_5);
}
};
_2.data.dom.replaceChildren=function(_7,_8){
_1.deprecated("dojox.data.dom.replaceChildren()","Use dojox.xml.parser.replaceChildren() instead.","2.0");
_2.xml.parser.replaceChildren(_7,_8);
};
_2.data.dom.removeChildren=function(_9){
_1.deprecated("dojox.data.dom.removeChildren()","Use dojox.xml.parser.removeChildren() instead.","2.0");
return _2.xml.parser.removeChildren(_9);
};
_2.data.dom.innerXML=function(_a){
_1.deprecated("dojox.data.dom.innerXML()","Use dojox.xml.parser.innerXML() instead.","2.0");
return _2.xml.parser.innerXML(_a);
};
return _2.data.dom;
});

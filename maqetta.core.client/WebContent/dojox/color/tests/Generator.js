dojo.provide("dojox.color.tests.Generator");
dojo.require("dojox.color.Generator");

var __p__, palette=function(){
	if(__p__) return __p__;
	__p__=document.createElement("div");
	var s=__p__.style;
	s.overflow="auto";
	s.padding="0 6px";
	//	drop it in the test thing
	var body=dojo.query("#testListContainer table tbody")[0];
	if(body){
		var tr=document.createElement("tr");
		var td=document.createElement("td");
		td.colSpan=4;
		td.appendChild(__p__);
		tr.appendChild(td);
		body.appendChild(tr);
	}
	return __p__;
}

tests.register("dojox.color.tests.Generator", [
	function testAnalogous(t){
		//	test the defaults
		var args={ base: new dojox.color.Color({ r:128, g:0, b:0 }) };
		var a=dojox.color.Generator.analogous(args);
		var s='<h3>dojox.color.Generator.analogous</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=5, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
//		t.debug(s+'</tr></table>');
		palette().innerHTML += s+'</tr></table>';
	},

	function testMonochromatic(t){
		//	test the defaults
		var a=dojox.color.Generator.monochromatic({ base:new dojox.color.Color({r:128, g:0, b:0}) });
		var s='<h3>dojox.color.Generator.monochromatic</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=8, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
	//	t.debug(s+'</tr></table>');
		palette().innerHTML += s+'</tr></table>';
	},

	function testTriadic(t){
		//	test the defaults
		var a=dojox.color.Generator.triadic({ base:new dojox.color.Color({r:128, g:0, b:0}) });
		var s='<h3>dojox.color.Generator.triadic</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=3, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
	//	t.debug(s+'</tr></table>');
		palette().innerHTML += s+'</tr></table>';
	},

	function testComplementary(t){
		//	test the defaults
		var a=dojox.color.Generator.complementary({ base:new dojox.color.Color({r:128, g:0, b:0}) });
		var s='<h3>dojox.color.Generator.complementary</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=2, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
	//	t.debug(s+'</tr></table>');
		palette().innerHTML += s+'</tr></table>';
	},

	function testSplitComplementary(t){
		//	test the defaults
		var a=dojox.color.Generator.splitComplementary({ base:new dojox.color.Color({r:128, g:0, b:0}) });
		var s='<h3>dojox.color.Generator.splitComplementary</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=3, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
	//	t.debug(s+'</tr></table>');
		palette().innerHTML += s+'</tr></table>';
	},

	function testCompound(t){
		//	test the defaults
		var a=dojox.color.Generator.compound({ base:new dojox.color.Color({r:128, g:0, b:0}) });
		var s='<h3>dojox.color.Generator.compound</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=4, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
	//	t.debug(s+'</tr></table>');
		palette().innerHTML += s+'</tr></table>';
	},

	function testShades(t){
		//	test the defaults
		var a=dojox.color.Generator.shades({ base:new dojox.color.Color({r:128, g:0, b:0}) });
		var s='<h3>dojox.color.Generator.shades</h3><table cellpadding="0" cellspacing="1" border="0"><tr>';
		var cols=8, c=0;
		dojo.forEach(a, function(item){
			if(c++%cols==0){ s+="</tr><tr>"; }
			s+='<td width="32" bgcolor="'+item.toHex()+'">&nbsp;</td>';
		});
		if(c<cols){
			for(; c<cols; c++){
				s+='<td width="32">&nbsp;</td>';
			}
		}
		palette().innerHTML += s+'</tr></table>';
//		t.debug(s+'</tr></table>');
	}
]);

dojo.provide("test.format");

dojo.require("davinci.js.JSModel");
dojo.require("davinci.js.Format");




function __testFormat(sourceText,testOptions)
{
	var options={blockNewLine:false,
	    blockIndent:3,
		functionNewLine:false,
		functionIndent:5,
		functionParamSpaceing:1,
		labelSpace:1,
		forParamSpacing:0,
		breakOnLabel:true,
		ifStmtSpacing:0,
		varAssignmentSpaceing:0,
		switchSpacing:3,
		objectLitFieldSpace:1};
	if (testOptions)
		dojo.mixin(options, testOptions);
	var jsFile = new davinci.js.JSFile();
	jsFile.setText(sourceText);
	var formated_text = davinci.js.format(jsFile,options);
	return formated_text;
}


tests.register("test.format", 
		[
			function format1(t){
				var unformatted="function      abc(def,jk){}"
				    var formatted="function abc (def, jk) {\n}\n"		
					t.assertEqual(formatted, __testFormat(unformatted));
				 unformatted="function      abc(def,jk){a=b;}"
					 formatted="function abc (def, jk) {\n     a=b;\n}\n"		
						t.assertEqual(formatted, __testFormat(unformatted));
				 unformatted="function      abc(def,jk){a=b}"
					 formatted="function abc (def, jk) {\n     a=b\n}\n"		
						t.assertEqual(formatted, __testFormat(unformatted));
			},
		function format3(t){
			var unformatted="callfunc(abc,def);"
			var formatted="callfunc(abc, def);"		
			t.assertEqual(formatted, __testFormat(unformatted));
		},
		function format4(t){
				var unformatted="a[4];\nd.dd+4;\nnew dd.ff(df,ef);\n"
				var formatted="a[4];\nd.dd+4;\nnew dd.ff(df, ef);"		
				t.assertEqual(formatted, __testFormat(unformatted));
				unformatted="(3>a)? true : ff++;\nd=[1,3];"
				formatted="(3>a) ? true : ff++;\nd=[1, 3];"		
				t.assertEqual(formatted, __testFormat(unformatted));
		},
		function format5(t){
			var unformatted="var a,b=2;\n"
			var formatted="var a, b=2;"		
			t.assertEqual(formatted, __testFormat(unformatted));
			unformatted="var a,b=2,d,e;\n"
			formatted="var a,\n    b=2,\n    d,\n    e;"		
			t.assertEqual(formatted, __testFormat(unformatted));
		},
		function format6(t){
			var unformatted="a={a:1};\n"
			var formatted="a={a : 1\n  };"		
			t.assertEqual(formatted, __testFormat(unformatted));
			unformatted="a={a:function(){}};\n"
			formatted="a={a : function () {\n   }\n  };"		
			t.assertEqual(formatted, __testFormat(unformatted));
			unformatted="a={a:1,b:2};\n"
			formatted="a={a : 1,\n   b : 2\n  };"		
			t.assertEqual(formatted, __testFormat(unformatted));
		},
		function format7(t) {
			var unformatted="if (true) ff(); else dd();\n"
			 var formatted="if (true)\n  ff();\nelse\n  dd();"
			 t.assertEqual(formatted, __testFormat(unformatted));
			unformatted = "if (true) {ff();} \n"
			formatted = "if (true) {\n   ff();\n}"
			t.assertEqual(formatted, __testFormat(unformatted));
			unformatted = "if (true) {ff();} else dd(); \n"
			formatted = "if (true) {\n   ff();\n}\nelse\n  dd();"
			t.assertEqual(formatted, __testFormat(unformatted));
		},
		function format8(t) {
			var unformatted="while(true) a++;\n"
			 var formatted="while (true)\n  a++;"
			 t.assertEqual(formatted, __testFormat(unformatted));
			unformatted = "while(true) {a++; b++;}\n"
			formatted = "while (true) {\n   a++;\n   b++;\n}"
			t.assertEqual(formatted, __testFormat(unformatted));
		},
		function format9(t) {
			var unformatted="switch(s){ case 1: aa(); default: bb();}\n"
			 var formatted="switch (s) {\n   case 1:\n      aa();\n   default:\n      bb();\n}"
			 t.assertEqual(formatted, __testFormat(unformatted));
//			unformatted = "while(true) {a++; b++;}\n"
//			formatted = "while (true) {\n   a++;\n   b++;\n}"
//			t.assertEqual(formatted, __testFormat(unformatted));
		}
		
		
		]
	);

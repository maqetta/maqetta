dojo.provide("dojox.xml.tests.parser");
dojo.require("dojox.xml.parser");

tests.register("dojox.xml.tests.parser",
	[
		function testParse(t){
			var document = dojox.xml.parser.parse();
			t.assertTrue(document !== null);
		},
		function testParseFromText(t){
			var simpleXml = "<parentNode><childNode><grandchildNode/></childNode><childNode/></parentNode>";
			var document = dojox.xml.parser.parse(simpleXml, "text/xml");
			
			var parent = document.firstChild;
			t.assertTrue(parent !== null);
			t.assertTrue(parent.tagName === "parentNode");
			t.assertTrue(parent.childNodes.length == 2);
			
			var firstChild = parent.firstChild;
			t.assertTrue(firstChild !== null);
			t.assertTrue(firstChild.tagName === "childNode");
			t.assertTrue(firstChild.childNodes.length == 1);
			
			var secondChild = firstChild.nextSibling;
			t.assertTrue(secondChild !== null);
			t.assertTrue(secondChild.tagName === "childNode");

			var grandChild = firstChild.firstChild;
			t.assertTrue(grandChild !== null);
			t.assertTrue(grandChild.tagName === "grandchildNode");

		},
		function testParseEmptyString(t){
			var simpleXml = "";
			var document = dojox.xml.parser.parse(simpleXml, "text/xml");
			
			t.assertTrue(typeof document != "undefined");

			var parent = document.firstChild;
			t.assertTrue(parent === null);
		},
		function testParseEmpty(t){
			var simpleXml;
			var document = dojox.xml.parser.parse();
			
			t.assertTrue(typeof document != "undefined");

			var parent = document.firstChild;
			t.assertTrue(parent === null);
		},
		function testReadTextContent(t){
			var text = "This is a bunch of child text on the node";
			var simpleXml = "<parentNode>" + text + "</parentNode>";
			var document = dojox.xml.parser.parse(simpleXml, "text/xml");
            
			var topNode = document.firstChild;
			t.assertTrue(topNode !== null);
			t.assertTrue(topNode.tagName === "parentNode");
			t.assertTrue(text === dojox.xml.parser.textContent(topNode));
			dojo.destroy(topNode);
			t.assertTrue(document.firstChild === null);
		},
		function testSetTextContent(t){
			var text = "This is a bunch of child text on the node";
			var text2 = "This is the new text";
			var simpleXml = "<parentNode>" + text + "</parentNode>";
			var document = dojox.xml.parser.parse(simpleXml, "text/xml");
            
			var topNode = document.firstChild;
			t.assertTrue(topNode !== null);
			t.assertTrue(topNode.tagName === "parentNode");
			t.assertTrue(text === dojox.xml.parser.textContent(topNode));
			dojox.xml.parser.textContent(topNode, text2);
			t.assertTrue(text2 === dojox.xml.parser.textContent(topNode));
			dojo.destroy(topNode);
			t.assertTrue(document.firstChild === null);

		},
		function testReplaceChildrenArray(t){
			var simpleXml1 = "<parentNode><child1/><child2/><child3/></parentNode>";
			var simpleXml2 = "<parentNode><child4/><child5/><child6/><child7/></parentNode>";
			var doc1 = dojox.xml.parser.parse(simpleXml1, "text/xml");
			var doc2 = dojox.xml.parser.parse(simpleXml2, "text/xml");
            
			var topNode1 = doc1.firstChild;
			var topNode2 = doc2.firstChild;
			t.assertTrue(topNode1 !== null);
			t.assertTrue(topNode1.tagName === "parentNode");
			t.assertTrue(topNode2 !== null);
			t.assertTrue(topNode2.tagName === "parentNode");
			dojox.xml.parser.removeChildren(topNode1);
			var newChildren=[];
			for(var i=0;i<topNode2.childNodes.length;i++){
				newChildren.push(topNode2.childNodes[i]);
			}
			dojox.xml.parser.removeChildren(topNode2);
			dojox.xml.parser.replaceChildren(topNode1,newChildren);
			t.assertEqual(4, topNode1.childNodes.length);
			t.assertEqual("child4", topNode1.firstChild.tagName);
			t.assertEqual("child7", topNode1.lastChild.tagName);

		},
		function testReplaceChildrenSingle(t){
			var simpleXml1 = "<parentNode><child1/><child2/><child3/></parentNode>";
			var simpleXml2 = "<parentNode><child4/></parentNode>";
			var doc1 = dojox.xml.parser.parse(simpleXml1, "text/xml");
			var doc2 = dojox.xml.parser.parse(simpleXml2, "text/xml");
            
			var topNode1 = doc1.firstChild;
			var topNode2 = doc2.firstChild;
			t.assertTrue(topNode1 !== null);
			t.assertTrue(topNode1.tagName === "parentNode");
			t.assertTrue(topNode2 !== null);
			t.assertTrue(topNode2.tagName === "parentNode");
			dojox.xml.parser.removeChildren(topNode1);
			
			var newChildren = topNode2.firstChild;
			dojox.xml.parser.removeChildren(topNode2);
			dojox.xml.parser.replaceChildren(topNode1,newChildren);
			t.assertTrue(topNode1.childNodes.length === 1);
			t.assertTrue(topNode1.firstChild.tagName === "child4");
			t.assertTrue(topNode1.lastChild.tagName === "child4");
		},
		function testRemoveChildren(t){
			var simpleXml1 = "<parentNode><child1/><child2/><child3/></parentNode>";
			var doc1 = dojox.xml.parser.parse(simpleXml1, "text/xml");
            
			var topNode1 = doc1.firstChild;
			t.assertTrue(topNode1 !== null);
			t.assertTrue(topNode1.tagName === "parentNode");
			dojox.xml.parser.removeChildren(topNode1);
			t.assertTrue(topNode1.childNodes.length === 0);
			t.assertTrue(topNode1.firstChild === null);
		},
		function testInnerXML(t){
			var simpleXml1 = "<parentNode><child1/><child2/><child3/></parentNode>";
			var doc1 = dojox.xml.parser.parse(simpleXml1, "text/xml");
            
			var topNode1 = doc1.firstChild;
			t.assertTrue(topNode1 !== null);
			t.assertTrue(topNode1.tagName === "parentNode");

			var innerXml = dojox.xml.parser.innerXML(topNode1);
			t.assertTrue(simpleXml1 === innerXml);
		}
	]
);

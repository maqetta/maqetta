dojo.provide("davinci.js.ui.FormatOptions");
dojo.require("davinci.ui.Panel");
dojo.require("davinci.js.JSModel");
dojo.require("davinci.js.Format");

dojo.require("davinci.workbench.PreferencePane");

dojo.declare("davinci.js.ui.FormatOptions",davinci.workbench.PanelPreferencePane, {
	getPanel : function (){
    var panel1 =
        [
      
         {
      	type:"layout",
      	left:[
          
          {
            type: "checkBox",
            label: "New line for blocks",
            data: "blockNewLine",
            defaultValue:true
          }
          ,
          {
            type: "numberTextBox",
            label: "Block indentation",
            data: "blockIndent",
            defaultValue:3,
            min:0, max:32
          }
          ,
          {
            type: "checkBox",
            label: "New line for function bodies",
            data: "functionNewLine",
            defaultValue:true
          }
          ,
          {
            type: "numberTextBox",
            label: "Function indentation",
            data: "functionIndent",
            defaultValue:5,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: "Function parameter list spacing",
            data: "functionParamSpaceing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: "Label spacing",
            data: "labelSpace",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "checkBox",
            label: "New line after label",
            data: "breakOnLabel",
            defaultValue:true
          },
          {
            type: "numberTextBox",
            label: "'for' statement parameter spacing",
            data: "forParamSpacing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: "'if' statement spacing",
            data: "ifStmtSpacing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: "'var' assignment spacing",
            data: "varAssignmentSpaceing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: "'switch'  spacing",
            data: "switchSpacing",
            defaultValue:3,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: "Object literal field spacing",
            data: "objectLitFieldSpace",
            defaultValue:1,
            min:0, max:32
          }
                 ],
        right:[
          
          {
            type: "dynamic",
            createNode : function (fieldData,parentNode,panel){
            
            var options=davinci.workbench.Preferences.getPreferences("davinci.js.format");
             var div = dojo.doc.createElement("div");

               dojo.connect(panel,"onChange",function(){
                  panel.saveData();
                  updateExample(panel.data);
               });

 		    function updateExample(options) {
 		    
               var exampleJS="function abc(def,jhk){ var a=1; var obj={a:2,b:'33'}; label: if (true) { return;} for (i;i<2;i++){} switch (a){case 1: a=1; case 2:a=2;}}";
 				var jsFile = new davinci.js.JSFile();
 				jsFile.setText(exampleJS);
 				var formatted_text = davinci.js.format(jsFile,options);
            
 	            div.innerHTML="<div border=\"3\"><pre>"+formatted_text+"</pre></div>";
 	            }
 	            
 	        updateExample(options);
 			return div;              
            }
          }
 	    ]
 	    }
        ];
    return panel1;
	}
});




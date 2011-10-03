({
	id: "davinci.de",
	
	"davinci.editor" : [ {
		id : "DijitEditor",
		name : "Dijit Visual Editor",
		extensions : "html",
		isDefault : true,
		// TODO implement icon : "",
		// requires : "davinci.de.HTMLVisualEditor",
		// editorClass : "davinci.de.HTMLVisualEditor"
		requires : "davinci.de.PageEditor",
		editorClass : "davinci.de.PageEditor"
	}, ],
	"davinci.actionSets" : [
			{
				id : "dijit",
				visible : true,
				
				actions : [
				        {
							id : "newWidget",
							run : "davinci.de.resource.createDijiFromNewDialog('dijit')",
							label : "Dijit Widget...",
							menubarPath : "davinci.new/new"
						}
				        ]
			}
	]

})
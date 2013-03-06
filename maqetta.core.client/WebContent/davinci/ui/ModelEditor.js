define([
	"dojo/_base/declare",
	"../Runtime",
	"./TextEditor", 
	"../commands/SourceChangeCommand"
], 
function(
	declare,
	Runtime,
	TextEditor,
	SourceChangeCommand
) {

return declare(TextEditor, {

    constructor: function (element, fileName) {
		this.subscribe("/davinci/ui/selectionChanged", this.selectModel);
	},
	
	colorize: function (text) {
	    return null;
	},
	
	setContent: function (filename, content) {
		this.inherited(arguments);
		this.model.fileName = filename;
		this.model.setText(content);
	},
		
    getHoverText: function(x,y) {
		var lineColPos = this.convertMouseToLine(x,y);
		var childModel = this.model.findChildAtPosition(
				{startOffset:lineColPos.row,endOffset:lineColPos.col});
		return childModel.getLabel();
	},
	
	handleChange: function(text) {
        this.inherited(arguments);
        var oldText = this.model.getText();
		var editor = Runtime.currentEditor;
		if (editor && editor.getCommandStack) {
			var commandStack = editor.getCommandStack();
			var command = new SourceChangeCommand({model:this.model, oldText:oldText, newText:text});
			commandStack.execute(command);
		} else {
			this.model.setText(text);
			dojo.publish("/davinci/ui/modelChanged", [{newModel: this.model}]);
		}
	},
	
	selectModel: function (selection, editor) {
		if (this.publishingSelect || (editor && this != editor)) {
			return;
		}
		
        if (selection.length && selection[0].model) {
			var model=selection[0].model;
			if (model.elementType) {
			    var sobj = this.model.mapPositions(model);
				this.select(sobj);
			}
		}
	},

	selectionChange: function (selection) {
		//Need to map the selection to the offsets in the model
		var mappedPosition = this.model.mapPositions(this.model);
		var diff = this.model.endOffset - mappedPosition.endOffset;
		var mappedSelection = {
			startOffset: selection.startOffset + diff,
			//subtract 1 for endOffset so that ">" of ending tag can selected and
			//still find a match
			endOffset: selection.endOffset + diff - 1
		};
       
		//Look for a child based on the updated selection offsets
		var childModel = this.model.findChildAtPosition(mappedSelection);
		selection.model = childModel;
		if (childModel != this._selectedModel) {
			try {
				this.publishingSelect = true;
				dojo.publish("/davinci/ui/selectionChanged", [[selection], this]);
			} finally {
				this.publishingSelect = false;
			}
		}
		this._selectedModel = childModel;
	},

	getSyntaxPositions: function (text,lineNumber) {
		
		this.model.setText(text);
		
		if (this.model.getSyntaxPositions) {
			return this.model.getSyntaxPositions(lineNumber).sort(
				function (a,b) {
					if (a.line != b.line) {
						return a.line-b.line;
					}
					return a.col-b.col;
				}
			);
		}
	},
	
	save: function () {
		this.model.setText(this.getText());
		this.inherited(arguments);
	},
	
	getErrors: function () {
	    return this.model.errors || []; // return empty array to be kind to iterators.
	}
});
});

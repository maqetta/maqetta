define(["dojo/_base/declare", "./TextEditor"], function(declare, TextEditor) {

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
        
        this.model.setText(text);
        
        var changeEvent = {
                newModel: this.model
        };
        dojo.publish("/davinci/ui/modelChanged", [changeEvent]);
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
			var positions = this.model.getSyntaxPositions(lineNumber);
		
			function sortPositions(a,b) {
				if (a.line != b.line) {
					return a.line-b.line;
				}
				return a.col-b.col;
			}
			positions = positions.sort(sortPositions);
			return positions;
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

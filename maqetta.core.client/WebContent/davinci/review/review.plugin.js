define([
	"davinci/css!./resources/Comment.css"
], function() {

return {
	id: "davinci.review",
	"davinci.view": [
		{
			id: "comment",
			title: "Comments",
			viewClass: "davinci/review/view/CommentView"
		},
		{
			id: "reviewNavigator",
			title: "Reviews",
			viewClass: "davinci/review/view/CommentExplorerView"

		},
		{
			id: "state",
			title: "States",
			viewClass: "davinci/ve/views/StatesView"
		}
	],
	"davinci.perspectiveExtension": [
		{
			targetID: "davinci.ve.pageDesign",
			views: [
				{
					viewID: "davinci.review.reviewNavigator",
					position: "left"
				}
			]
		}
	],
	"davinci.perspective": {
		id: "comment",
		title: "Comment",
		views: [
			{
				viewID: "davinci.review.reviewNavigator",
				position: "left"
			},
			{
				viewID: "davinci.review.comment",
				position: "left"
			},
			{
				viewID: "davinci.review.state",
				position: "right"
			}
		]
	},
	"davinci.editor": [
		{
			id: "CommentReviewEditor",
			name: "Review Editor",
			extensions: "rev",
			isDefault: true,
			editorClass: "davinci/review/editor/ReviewEditor",
			editorClassName: "ReviewEditor",
            palettesToTop: [
                "davinci.review.reviewNavigator", //Reviews
                "davinci.ui.comment", //Comments
                "davinci.ve.states" //States(Scenes)
            ]
		}
	],
	"davinci.fileType": [
		{
			extension: "rev",
			iconClass: "reviewFileIcon",
			type: "text"
		}
	],
	"davinci.actionSets": [
		{
			id: "main",
			visible: true,
			actions: [
				{
					id: "newReview",
					run: function(){
						require("davinci/Runtime").publish();
					},
					label: "Review...",
					menubarPath: "davinci.new/additions"
				}
			]
		},
		{
			id: "reviewExplorerActions",
			visible: true,
			actions: [
				{
					id: "davinci.review.view",
					label: "View Page",
					action: "davinci/review/actions/ViewFileAction",
					//iconClass: "viewActionIcon reviewFileIcon",
					menubarPath: "newfile"
				},
				{
					id: "davinci.review.edit",
					label: "Edit...",
					action: "davinci/review/actions/EditVersionAction",
					//iconClass: "viewActionIcon editVersionIcon",
					menubarPath: "newfile"
				},
		/*{
								    id: "davinci.review.submitDraft",
								    label: "Submit the draft",
									action: "davinci/review/actions/SubmitDraftAction",
									menubarPath: "newfile"
								},*/
				{
					id: "davinci.review.close",
					label: "Terminate",
					action: "davinci/review/actions/CloseVersionAction",
					//iconClass: "viewActionIcon closeVersionIcon",
					menubarPath: "newfile"
				},
				{
					id: "davinci.review.open",
					label: "Start",
					action: "davinci/review/actions/OpenVersionAction",
					//iconClass: "viewActionIcon openVersionIcon",
					menubarPath: "newfile"
				},
				{
					id: "davinci.review.delete",
					label: "Delete",
					action: "davinci/review/actions/DeleteVersionAction",
					//iconClass: "viewActionIcon deleteVersionIcon",
					menubarPath: "newfile"
				},
				{
					id: "davinci.review.restart",
					label: "Renew",
					action: "davinci/review/actions/RestartVersionAction",
					menubarPath: "newfile"
				}
			]

		}
	],
	"davinci.actionSetPartAssociations": [
		{
			targetID: "davinci.review.reviewExplorerActions",
			parts: ["davinci.review.reviewNavigator"]
		}
	],
	"davinci.annotationActions": {
		editorContribution: {
			actions: [
				{
					id: "arrow",
					label: "Draw arrow",
					iconClass: "davinciAnnotationIcon davinciAnnotationIconArrow",
					action: "davinci/review/actions/ArrowAction",
					toolbarPath: "annotationtools"
				},
				{
					id: "rect",
					label: "Draw rectangle",
					iconClass: "davinciAnnotationIcon davinciAnnotationIconRect",
					action: "davinci/review/actions/RectAction",
					toolbarPath: "annotationtools"
				},
				{
					id: "ellipse",
					label: "Draw ellipse",
					iconClass: "davinciAnnotationIcon davinciAnnotationIconEllipse",
					action: "davinci/review/actions/EllipseAction",
					toolbarPath: "annotationtools"
				},
				{
					id: "textAnnotation",
					label: "Draw text",
					iconClass: "davinciAnnotationIcon davinciAnnotationIconText",
					action: "davinci/review/actions/TextAction",
					toolbarPath: "annotationtools"
				}
			]
		}
	},
    "davinci.editorActions": {
        editorContribution: {
            targetID: "davinci.review.CommentReviewEditor",
            actions: [
                {
                    id: "ReviewToolBarText",
                    type: "davinci/review/widgets/ReviewToolBarText",
                    toolbarPath: "ReviewToolBarText"
                }
            ]
        }
    }

};

});
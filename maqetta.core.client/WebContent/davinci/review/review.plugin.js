define([
	"davinci/css!./resources/Comment.css"
], function() {

return {
	id: "davinci.review",
	"davinci.view": [
		{
			id: "comment",
			title: "Comments",
			viewClass: "davinci/review/view/CommentView",
            iconClass: "paletteIcon paletteIconComments"
		},
		{
			id: "reviewNavigator",
			title: "Reviews",
			viewClass: "davinci/review/view/CommentExplorerView",
            iconClass: "paletteIcon paletteIconReviews"

		},
		{
			id: "state",
			title: "States",
			viewClass: "davinci/ve/views/StatesView",
            iconClass: "paletteIcon paletteIconStates"
		}
	],
	"davinci.perspective": {
		id: "review",
		title: "Review",
		views: [
            {
                viewID: "davinci.ve.Palette",
                position: "left",
                hidden: true
            },
            {
                viewID: "davinci.ui.outline",
                position: "left",
                hidden: true
            },
            {
                viewID: "davinci.ve.style",
                position: "right"
            },
            {
                viewID: "davinci.ui.comment",
                position: "right",
                selected: true
            },
            {
                viewID: "davinci.ve.states",
                position: "right-bottom"
            },
            {
                viewID: "davinci.ui.navigator",
                position: "left-bottom"
            },
            {
                viewID: "davinci.review.reviewNavigator",
                position: "left",
                selected: true
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
			palettePerspective: "davinci.review.review",
	        expandPalettes: ["right"]
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
			id: "editorActionsReview",
			visible: true,
			actions: [
				{
					id: "newReview",
					action: "davinci/review/actions/PublishAction",
	                iconClass: "newOpenMenuItem newReviewMenuItem",
					label: "Review...",
					menubarPath: "davinci.new/newTheme"
				}
			]
		},
		{
			id: "reviewExplorerActions",
			visible: true,
			actions: [
				{
					id: "davinci.review.view",
					label: "Open",
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
				{
					id: "davinci.review.open",
					label: "Start",
					action: "davinci/review/actions/OpenVersionAction",
					//iconClass: "viewActionIcon openVersionIcon",
					menubarPath: "newfile"
				},
				{
					id: "davinci.review.close",
					label: "Stop...",
					action: "davinci/review/actions/CloseVersionAction",
					//iconClass: "viewActionIcon closeVersionIcon",
					menubarPath: "newfile"
				},
				{
					id: "davinci.review.delete",
					label: "Delete...",
					action: "davinci/review/actions/DeleteVersionAction",
					//iconClass: "viewActionIcon deleteVersionIcon",
					menubarPath: "newfile",
					keyBinding: {charOrCode: [dojo.keys.DELETE, dojo.keys.BACKSPACE]}
				},
				{
					id: "davinci.review.restart",
					label: "Republish...",
					action: "davinci/review/actions/RestartVersionAction",
					menubarPath: "newfile"
				}
			]

		}
	],
	"davinci.actionSetPartAssociations": [
		{
			targetID: "davinci.review.editorActionsReview",
			parts: ["davinci.ui.editorMenuBar"]
		  },
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
				},
				{
				    id: "deleteAnnotation",
				    iconClass: "davinciAnnotationIcon davinciAnnotationIconDelete",
				    label: "Delete Annotation",
				    action: "davinci/review/actions/DeleteAnnotationAction",
				    toolbarPath: "annotationtools_delete",
				    keyBinding: {charOrCode: [dojo.keys.DELETE, dojo.keys.BACKSPACE]}
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
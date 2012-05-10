define({ root:
{
		//SwitchingStyleView.js
		"common":"Common",
		"widgetSpecific":"Widget-specific",
		"events":"Events",
		"layout":"Layout",
		"showMinMax":"show min/max",
		"paddingMargins":"Padding/Margins",
		"showtrbl":"show t/r/b/l",
		"background":"Background",
		"border":"Border",
		"showDetails":"show details",
		"fontsAndText":"Fonts and Text",
		"shapesSVG":"Graphics/SVG",
		
		//StatesView.js
		"Scenes":"Scenes",
		"States":"States",
		
		//DeviceActions.js
		"chooseDeviceSilhouette":"Choose a device silhouette: ",
		
		//SelectAncestorAction.js
		"selectAncestorTitle":"Select ancestor",
		"selectAncestorLabel":"Select ancestor (closest ancestor listed first):",
		
		//actions/StateActions.js
		"createNewState":"Create New State",
		"createLabel":"Create",
		"stateLabel":"State",
		"enterStateName":"Please enter a state name.",
		"stateNameExists":"State name '${name}' already exists. Please enter a different state name.",
		
		//input/RichTextInput.js
		"richTextInputHelp":"Provides Rich Text (word processor-like) editing of HTML.",
		
		//input/SmartInput.js
		"smartInputHelp1":"If you use any markup characters (&lt;,&gt;,&amp;), you need to specify whether the text represents literal (plain) text or HTML markup that should be parsed (using an innerHTML assignment).",
		"smartInputHelp2":"Text represents literal (plain) text.",
		"loading":"Loading...",
		"htmlMarkup":"HTML markup",
		
		//widgets/Cascade.js
		"creatingStyleRules":"Creating Style Rules with app.css",
		"propChangeCannotComplete":"This property change cannot be completed because the operation attempts to modify a read-only theme CSS file.",
		"toChangeProperty":"To change this property, one technique is to add a class to this widget (at top of Properties palette)  and then open up the CSS Details pane to target a style rule within your app.css file, as described at ${0}.",
		"errorModifyingValue":"Error modifying value",
		"changeWillModify":"This change will modify one of the CSS style rules defined within a 'CSS theme' and will therefore probably impact other widgets on a global basis.",
		"insteadOfChanging":"Instead of changing the theme CSS files, it is usually better to add a class to this widget (at the top of the Properties palette) and then open up the CSS Details pane to target a style rule within your app.css file, as described at ${0}.",
		"okToProceed":"OK to proceed with this change?",
		"valueIsOverriden":"This value is overriden and can not be changed.",
		"applyToWhich":"Apply to which style rule:",
		"onlyApplyToState":" Only apply to current state (${0})",
		"newRule":"[class: ${0} - New rule in ${1}] ",
		"newThemeRule":"[theme: - New rule in ${0}] ",
		"existingRule":"[class: ${0} - Existing rule in ${1}] ",
		"line":" line: ${0})",
		"propUndefined":"undefined",
		
		//widgets/BackgroundDialog.js
		//background-image type dropdown
		"bgdType_emptystring":"",	// For all languages, must be an empty string
		"bgdType_none":"none",
		"bgdType_url":"image",	// In English, value='url' but displayValue='image'
		"bgdType_linear":"linear gradient",
		"bgdType_radial":"radial gradient",
		"bgdType_other":"other",
		//File picker launch button
		"bgdPickFile":"Choose...",
		//stops
		"bgdStop":"Stop",
		"bgdAddStop":"Add a new gradient stop after this stop",
		"bgdRemoveStop":"Remove this gradient stop",
		
		//widgets/ColorPicker.js
		"colorPicker":"Color picker...",
		"removeValue":"Remove Value",
		"selectColor":"select a color",
		
		//widgets/WidgetToolBar.js
		"toolBarFor":"for: ",
		"noSelection":"(no selection)",
		"toolBarClass":"class:",
		"toolBarId":"ID:",
		
		//tools/CreateTool.js
		"noValidParents":"No valid parents at this position",
		"willBeChildOf":"Will become a child of:",
		"candidateParents":"Candidate parents:",
		"toChangePress":"To change, press numbers"
}
});

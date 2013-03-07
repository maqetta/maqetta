define({ root:
{
		/*Currently this file is also used for davinci.review/WebContent/review.html*/
		//pagedesigner.html
		"designer":"Designer,",
		"welcome":"Welcome",//also in review.html
		"loadingMaqetta":"&nbsp;Loading Maqetta...",
		startupError: "Error starting Maqetta: ${0}",
		"logOff":"Log Out",//also in review.html
		"unsupportedBrowser":"Unsupported Browser",
		"unsupportedNote":"Maqetta supports Firefox 4, Chrome 5, and Safari 5.1 or greater. If you wish to continue with an unsupported browser, click \"Continue.\"",
		"buttonContinue":"Continue",
		"pageDesignerTitle":"Maqetta Designer",
		"maqettaUser":"Maqetta User",
		"localhostUser":"localhost user",
		"sessionTimedOut":"Session timed out",
		"sessionTimedOutMsg": "The session has timed out, please <a href='${hrefLoc}'>log in</a> again. (Auto-redirect within 10 seconds)",
		
		//preview.html
		"devicePreviewError":"Maqetta device previewer error. Must supply URL parameter 'file='",
		"devicePreviewPreviewing":"Previewing:",
		
		//davinci.review/WebContent/review.html
		"help":"Help",
		"tutorials":"Tutorials",
		"aboutMaqetta":"About Maqetta",
		"review":"Review and Commenting,",
		"reviewPageTitle":"Maqetta Review Board",
		
		//davinci/Runtime.js
		"careful":"Warning: You are about to leave Maqetta.",
		"errorLoadingPlugin":"error loading plugin ${0}, response=${1}",
		"errorLoadingPlugins":"error loading plugins",
		"multipleFilesUnsaved":"${0} (NOTE: This is one of ${1} files with unsaved changes.)",
		"idleSessionMessage": "Your session will timeout in ${seconds} seconds, click anywhere in the page to continue using Maqetta.",
		
		//davinci/Workbench.js
		"fileHasUnsavedChanges":"Save changes to ${0}?",
		"perspectiveNotFound":"perspective not found: ${0}",
		"scopeNotDefined":"scope not defined for action: ${0}",
		"funcNotDefined":"function not defined for action: ${0}",
		"serverConnectError":"<h3>Error connecting to the Maqetta Server.</h3><br><div>Please click here to <a href='${redirectUrl}'>return to Maqetta</a><div><div>Error description: ${error}</div>"
}
});

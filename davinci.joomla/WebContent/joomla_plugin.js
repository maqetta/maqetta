(
{
	id: "joomlaplugin",
	"davinci.actionSets":
	[
	 {
		 id: "joomlaPlugin",
		 visible:true,

		actions: [
					{
						id: "davinciCommunity",
						run: "window.open('http://'+window.location.hostname+'/index.php?option=com_content&view=article&id=15')",
						label: "Community",
						menubarPath: "davinci.help/help"
					}
		]
	 }
	]
}
)
<?php
	// If you call this file like multipleLayoutWidgets.php?id=foo then the id's of the created widgets
	// will be based on the string "foo"
	$id = $_GET['id'];
?>
This file has some nested layout widgets, and when this file is loaded the TabContainer and
BorderContainer below should get resize() called on them
<div dojoType="dijit.layout.TabContainer" id="<?=$id?>TabContainer" style="width: 300px; height: 300px;">
	<div dojoType="dijit.layout.ContentPane" title="Tab 1">doc4 tab1</div>
	<div dojoType="dijit.layout.ContentPane" title="Tab 2">doc4 tab2</div>
</div>
<div dojoType="dijit.layout.BorderContainer" id="<?=$id?>BorderContainer" style="width: 300px; height: 300px;">
	<div dojoType="dijit.layout.ContentPane" region="center">inner border container</div>
</div>
<?php
	// This file is loaded by the test files via ContentPane's href attribute.

	// If you call this file like borderContainer.php?id=foo then the id's of the created widgets
	// will be based on the string "foo"
	$id = $_GET['id'];

	// sized=true means that it will add a width/height to the BorderContainer
?>
<div dojoType="dijit.layout.BorderContainer"
	id="<?=$id?>BorderContainer"
	<?php
		if($_GET['sized']){
			print "style='width: 300px; height: 300px;'";
		}
	?>
>
	<div dojoType="dijit.layout.ContentPane" region="left" style="width: 200px;">
		This file contains a single top-level BorderContainer layout widget.
	</div>
	<div dojoType="dijit.layout.ContentPane" region="center" onLoad="myOnLoad">
		But it also has some nested layout widgets, and when this file is loaded the TabContainer and
		BorderContainer below should get resize() called on them
		<div dojoType="dijit.layout.TabContainer" id="<?=$id?>InnerTabContainer" style="width: 300px; height: 300px;">
			<div dojoType="dijit.layout.ContentPane" title="Tab 1"><?=$id?> tab1</div>
			<div dojoType="dijit.layout.ContentPane" title="Tab 2"><?=$id?> tab2</div>
		</div>
		<div dojoType="dijit.layout.BorderContainer" id="<?=$id?>InnerBorderContainer" style="width: 300px; height: 300px;">
			<div dojoType="dijit.layout.ContentPane" region="center">inner border container</div>
		</div>
	</div>
</div>
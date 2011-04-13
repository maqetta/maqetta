<!DOCTYPE html><html><head><title>Sample1</title>
<style type="text/css">
@import "themes/claro/claro.css";
@import "lib/dojo/dojo/resources/dojo.css";
@import "app.css";
</style>
<script type="text/javascript" src="lib/dojo/dojo/dojo.js" djConfig="parseOnLoad: true"></script>
<script src="maqetta/States.js"></script>
<script src="maqetta/maqetta.js"></script>
<script type="text/javascript">
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.MultiSelect");
</script>
</head>
<body class="claro lotusui" dvStates="{'Add Task':{'origin':true},'Task Added':{'origin':true},'current':'Task Added'}" data-davinci-ws="collapse" dvFlowLayout="true" id="myapp">
<SPAN dojoType="dijit.layout.TabContainer" style="width: 250px; height: 250px;" controllerWidget="dijit.layout.TabController">
<DIV dojoType="dijit.layout.ContentPane" title="Tasks" parseOnLoad="true" isContainer="true" style="width: 232px; height: 203px;">
<DIV style="text-align: right;">
<input type="button" dojoType="dijit.form.Button" disabled="false" intermediateChanges="false" label="New"></input>
<INPUT type="button" dojoType="dijit.form.Button" label="Del" showLabel="true" scrollOnFocus="true"></INPUT>
</DIV>
<DIV style="padding-top: 10px; padding-bottom: 10px;"><LABEL>Sort-by:</LABEL>
<SELECT dojoType="dijit.form.ComboBox" value="Name" autoComplete="true" ignoreCase="true" hasDownArrow="true" scrollOnFocus="true" style="width: 121px; margin-left: 5px;"><OPTION value="Name" selected="true">Name</OPTION>
<OPTION value="Due date">Due date</OPTION>
</SELECT>
</DIV>
<SELECT multiple="true" dojoType="dijit.form.MultiSelect" scrollOnFocus="true" style="display: none; width: 200px;" dvStates="{'Task Added':{'style':{'display':''}}}"><OPTION value="Task 1">Task 1</OPTION>
</SELECT>
</DIV>
<DIV dojoType="dijit.layout.ContentPane" title="Projects" parseOnLoad="true" isContainer="true" style="width: 232px; height: 203px;"></DIV>
<DIV dojoType="dijit.layout.ContentPane" title="Roles"></DIV>
</SPAN>
<DIV dojoType="dijit.layout.ContentPane" title="Pane" style="display: none; border-width: 1px; border-style: solid; border-color: #1c15df; position: absolute; width: 327px; height: 72px; left: 50px; top: 76px; background-color: #ffffff;" dvStates="{'Add Task':{'style':{'display':''}}}"><DIV children="Add new task" style="font-weight: bold; text-align: center; padding-top: 6px; padding-bottom: 6px;">Add new task</DIV>
<DIV><LABEL>Task name:</LABEL>
<INPUT type="text" dojoType="dijit.form.TextBox"></INPUT>
<INPUT type="button" dojoType="dijit.form.Button" label="Add" showLabel="true" scrollOnFocus="true" onclick="davinci.states.setState('Task Added')"></INPUT>
</DIV>
</DIV>
</body>
</html>

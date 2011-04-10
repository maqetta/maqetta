dojo.provide("dojox.grid.enhanced.plugins.DnD");

dojo.require("dojox.grid.enhanced.dnd._DndMovingManager");

dojo.declare("dojox.grid.enhanced.plugins.DnD", dojox.grid.enhanced.dnd._DndMovingManager, {
	//	summary:
	//		 Provides dnd support for row(s) and column(s)
	// example:
	// 		 <div dojoType="dojox.grid.EnhancedGrid" plugins="{dnd: true}" ...></div>
});

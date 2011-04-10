// Helper methods for automated testing

function isVisible(node){
		if(node.domNode){ node = node.domNode; }
		return (dojo.style(node, "display") != "none") &&
				(dojo.style(node, "visibility") != "hidden") &&
				(dojo.position(node).y + (dojo._getBorderExtents(node).t || 0) >= 0); // border check is for claro prone to shifting the border offscreen
}

function isHidden(node){
		if(node.domNode){ node = node.domNode; }
		return (dojo.style(node, "display") == "none") ||
				(dojo.style(node, "visibility") == "hidden") ||
				(dojo.position(node).y < 0); // + dojo.position(node).h ??
}

function innerText(node){
	return node.textContent || node.innerText || "";
}

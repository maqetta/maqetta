package org.davinci.server.review.command;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.Version;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;

public class ListReviewFiles extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user)
			throws IOException {
		ReviewManager commentingManager = ReviewManager.getReviewManager();
		String designerName = req.getParameter("designer");
		if(designerName ==null||designerName.equals(""))
			designerName = user.getUserName();
		DesignerUser designer = commentingManager.getDesignerUser(designerName);
		Version version = designer.getVersion(req.getParameter("version"));
		List<String> resource = version.getResources();
		JSONWriter writer = new JSONWriter(true);
		for (String it : resource) {
			writer.startObject();
			writer.addField("path", it);
			writer.endObject();
		}

		this.responseString = writer.getJSON();

	}

}

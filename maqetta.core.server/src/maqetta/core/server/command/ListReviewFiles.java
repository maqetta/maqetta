package maqetta.core.server.command;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.Version;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;
import org.maqetta.server.Command;

public class ListReviewFiles extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {
		ReviewManager commentingManager = ReviewManager.getReviewManager();
		String designerName = req.getParameter("designer");
		if(designerName ==null||designerName.equals(""))
			designerName = user.getUserID();
		IDesignerUser designer = commentingManager.getDesignerUser(designerName);
		Version version = designer.getVersion(req.getParameter("version"));
		List<String> resource = version.getResources();
		JSONWriter writer = new JSONWriter(true);
		for (String it : resource) {
			writer.startObject();
			writer.addField("path", it);
			writer.endObject();
		}

		this.responseString = writer.getJSON();
        resp.setContentType("application/json;charset=UTF-8");
	}
}

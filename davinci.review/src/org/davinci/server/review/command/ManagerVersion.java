package org.davinci.server.review.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.user.User;

public class ManagerVersion extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user)
			throws IOException {
		String type = req.getParameter("type"); // three types: close, open, delete and publish
		String vTime = req.getParameter("vTime");
		DesignerUser du = ReviewManager.getReviewManager()
				.getDesignerUser(user.getUserName());
		Version version = du.getVersion(vTime);
		ReviewManager reviewManager = ReviewManager.getReviewManager();
		if ("close".equalsIgnoreCase(type)) {
			version.closeVersion();
			reviewManager.saveVersionFile(du);
		} else if ("open".equalsIgnoreCase(type)) {
			version.openVersion();
			version.setHasRestarted(false);
			reviewManager.saveVersionFile(du);
		} else if ("publish".equalsIgnoreCase(type)) {
			version.setDraft(false);
			reviewManager.publish(du.getName(), version);
		} else if ("delete".equalsIgnoreCase(type)) {
			du.deleteVersion(vTime);
			reviewManager.saveVersionFile(du);
			DavinciProject project = new DavinciProject();
			project.setOwnerId(du.getName());
			ReviewCacheManager.$.clearReviewByProject(project);
			// TODO delete the version folder
		}
		this.responseString = "OK";
	}

}

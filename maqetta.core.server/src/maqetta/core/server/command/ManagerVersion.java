package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.DavinciProject;
import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IDavinciProject;
import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class ManagerVersion extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {
		String type = req.getParameter("type"); // three types: close, open, delete and publish
		String vTime = req.getParameter("vTime");
		IDesignerUser du = ReviewManager.getReviewManager()
				.getDesignerUser(user);
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
			reviewManager.publish(du, version);
		} else if ("delete".equalsIgnoreCase(type)) {
			du.deleteVersion(vTime);
			reviewManager.saveVersionFile(du);
			IDavinciProject project = new DavinciProject();
			project.setOwnerId(du.getName());
			ReviewCacheManager.$.clearReviewByProject(project);
			// TODO delete the version folder
		}
		this.responseString = "OK";
	}

}

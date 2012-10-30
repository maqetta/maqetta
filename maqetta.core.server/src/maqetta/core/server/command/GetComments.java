package maqetta.core.server.command;

import java.io.IOException;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.DavinciProject;

import org.davinci.server.review.Comment;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class GetComments extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {
		String projectOwner = req.getParameter("ownerId");
		String projectName = req.getParameter("projectName");
		String pageName = req.getParameter("pageName");

		DavinciProject project = new DavinciProject();
		project.setOwnerId(projectOwner);
		//project.setProjectName(projectName);
		// FIXME Currently, there is not project concept, use the default value.
		// project.setProjectName(projectName);
		List<Comment> commList = ReviewCacheManager.$.getCommentsByPageName(project, pageName);
		responseString = commList.toString();
	}
}

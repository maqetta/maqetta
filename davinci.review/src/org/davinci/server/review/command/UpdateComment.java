package org.davinci.server.review.command;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.review.Comment;
import org.davinci.server.review.Constants;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.ReviewObject;
import org.davinci.server.review.Util;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.persistence.CommentDao;
import org.davinci.server.review.persistence.CommentDaoFactory;
import org.davinci.server.review.persistence.CommentDaoFactory.DaoType;
import org.davinci.server.user.User;
import org.davinci.server.user.UserManager;

public class UpdateComment extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user)
			throws IOException {
		UserManager userManager = ServerManager.getServerManger().getUserManager();
		String designerName = ((ReviewObject) req.getSession().getAttribute(
				Constants.REVIEW_INFO)).getDesignerName();
		DesignerUser du =ReviewManager.getReviewManager()
				.getDesignerUser(designerName);
		DavinciProject project = new DavinciProject();
		project.setOwnerId(du.getName());

		Comment comment = extractComment(req, project);
		Comment existingComm = ReviewCacheManager.$.getComment(project, comment.getId());
		Version version = du.getVersion(existingComm.getPageVersion());
		boolean isUpdateStatus = Boolean.parseBoolean(req.getParameter("isUpdateStatus"));
		try {
			if (version != null && version.isClosed()&&!isUpdateStatus)
				throw new Exception(
						"The version is closed by others during your editting. Please reload the review data.");

			CommentDao commDao = CommentDaoFactory.getInstance(DaoType.XML);
			if (null != commDao) {
				List<Comment> commentList = new ArrayList<Comment>(1);
				commentList.add(comment);
				commDao.updateComment(commentList);
			} else
				throw new RuntimeException("Server error!");
		} catch (Exception e) {
			e.printStackTrace();
			errorString = "The review is failed to be updated. Reason: " + e.getMessage();
			resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, errorString);
		}
	}

	private Comment extractComment(HttpServletRequest req, DavinciProject project) {
		Comment comment = new Comment();
		String paramValue;

		comment.setProject(project);

		paramValue = req.getParameter(Comment.ID);
		comment.setId(paramValue);

		paramValue = req.getParameter(Comment.CONTENT);
		comment.setContent(paramValue);

		paramValue = req.getParameter(Comment.PAGE_STATE);
		comment.setPageState(paramValue);

		paramValue = req.getParameter(Comment.SUBJECT);
		comment.setSubject(paramValue);

		paramValue = req.getParameter(Comment.DRAWING_JSON);
		comment.setDrawingJson(paramValue);

		paramValue = req.getParameter(Comment.SEVERITY);
		comment.setSeverity(paramValue);

		paramValue = req.getParameter(Comment.TYPE);
		comment.setType(paramValue);

		paramValue = req.getParameter(Comment.STATUS);
		comment.setStatus(paramValue);

		comment.setCreated(Util.getCurrentDateInGmt0());

		return comment;
	}
}

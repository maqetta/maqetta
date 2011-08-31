package org.davinci.server.review.command;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.review.Comment;
import org.davinci.server.review.Constants;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.ReviewObject;
import org.davinci.server.review.Utils;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.user.DesignerUser;
import org.davinci.server.user.User;

public class UpdateComment extends Command {
	boolean isUpdateStatus;
	
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user)
			throws IOException {
		String designerName = ((ReviewObject) req.getSession().getAttribute(
				Constants.REVIEW_INFO)).getDesignerName();
		DesignerUser du =ReviewManager.getReviewManager().getDesignerUser(designerName);
		DavinciProject project = new DavinciProject();
		project.setOwnerId(du.getName());

		Comment comment = extractComment(req, project);
		Comment existingComm = ReviewCacheManager.$.getComment(project, comment.getId());
		Version version = du.getVersion(existingComm.getPageVersion());
		isUpdateStatus = Boolean.parseBoolean(req.getParameter("isUpdateStatus"));
		try {
			if (version != null && version.isClosed() && !isUpdateStatus){
				throw new Exception("The version is closed by others during your editting. Please reload the review data.");
			}

			List<Comment> commentList = new ArrayList<Comment>(1);
			commentList.add(comment);
			updateComments(commentList);
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

		comment.setCreated(Utils.getCurrentDateInGmt0());

		return comment;
	}
	
	private boolean updateComments(List<Comment> commentList) throws Exception {
		if (commentList == null || commentList.isEmpty())
			return true;

		Comment existingComment;
		List<Comment> subCommentList = null;

		for (Comment comment : commentList) {
			existingComment = ReviewCacheManager.$.getComment(comment.getProject(), comment.getId());
			if (existingComment != null) {
				existingComment = (Comment)Utils.deepClone(existingComment); // Make a copy of it
				if (comment.getContent() != null)
					existingComment.setContent(comment.getContent());
				if (comment.getPageState() != null)
					existingComment.setPageState(comment.getPageState());
				if (comment.getSubject() != null)
					existingComment.setSubject(comment.getSubject());
				if (comment.getDrawingJson() != null)
					existingComment.setDrawingJson(comment.getDrawingJson());
				if (comment.getSeverity() != null)
					existingComment.setSeverity(comment.getSeverity());
				if (comment.getType() != null)
					existingComment.setType(comment.getType());
				if (comment.getStatus() != null	&& !existingComment.getStatus().equals(comment.getStatus())) {
					existingComment.setStatus(comment.getStatus());
					subCommentList = getThread(existingComment, ReviewCacheManager.$.getCommentsByPageName(comment.getProject(), comment.getPageName()));
				}
				if(null == subCommentList){
					subCommentList = new ArrayList<Comment>();
				}
				subCommentList.add(existingComment);
				ReviewCacheManager.$.updateComments(subCommentList, isUpdateStatus);
			}
		}

		return true;
	}

	private List<Comment> getThread(Comment comment, List<Comment> commentList) {
		// Update all the children status
		List<Comment> subCommentList = new ArrayList<Comment>();
		for (Comment c : commentList) {
			if(!c.getId().equals(comment.getId()) && getTopParent(c).getId().equals(comment.getId())) {
				c = (Comment)Utils.deepClone(c); // Another copy
				c.setStatus(comment.getStatus());
				getThread(c, commentList);
				subCommentList.add(c);
			}
		}
		return subCommentList;
	}
	
	private Comment getTopParent(Comment comment){
		while(!Utils.isBlank(comment.getReplyTo())&&!"0".equals(comment.getReplyTo())){
			comment = ReviewCacheManager.$.getComment(comment.getProject(), comment.getReplyTo());
		}
		return comment;
	}
}

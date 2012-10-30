package maqetta.core.server.command;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.DavinciProject;
import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.Comment;
import org.davinci.server.review.Utils;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class UpdateComment extends Command {
	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {

		Comment comment = extractComment(req);
		
		String designerName = comment.getDesignerId();
		IDesignerUser du = ReviewManager.getReviewManager().getDesignerUser(designerName);
		DavinciProject project = new DavinciProject();
		project.setOwnerId(du.getName());
		
		comment.setProject(project);
		Comment existingComm = ReviewCacheManager.$.getComment(project, comment.getId());
		Version version = du.getVersion(existingComm.getPageVersion());
		try {
			if (version != null && version.isClosed()){
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

	private Comment extractComment(HttpServletRequest req) {
		Comment comment = new Comment();
		String paramValue;

		paramValue = req.getParameter(Comment.ID);
		comment.setId(paramValue);
		
		paramValue = req.getParameter(Comment.DESIGNER_ID);
		comment.setDesignerId(paramValue);

		paramValue = req.getParameter(Comment.CONTENT);
		comment.setContent(paramValue);

		paramValue = req.getParameter(Comment.PAGE_STATE);
		comment.setPageState(paramValue);

		paramValue = req.getParameter(Comment.PAGE_STATE_LIST);
		comment.setPageStateList(paramValue);

		paramValue = req.getParameter(Comment.VIEW_SCENE);
		comment.setViewScene(paramValue);

		paramValue = req.getParameter(Comment.VIEW_SCENE_LIST);
		comment.setViewSceneList(paramValue);

		paramValue = req.getParameter(Comment.SUBJECT);
		comment.setSubject(paramValue);

		paramValue = req.getParameter(Comment.DRAWING_JSON);
		comment.setDrawingJson(paramValue);

		comment.setCreated(new Date());

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
				if (comment.getPageStateList() != null)
					existingComment.setPageStateList(comment.getPageStateList());
				if (comment.getViewScene() != null)
					existingComment.setViewScene(comment.getViewScene());
				if (comment.getViewSceneList() != null)
					existingComment.setViewSceneList(comment.getViewSceneList());
				if (comment.getSubject() != null)
					existingComment.setSubject(comment.getSubject());
				if (comment.getDrawingJson() != null)
					existingComment.setDrawingJson(comment.getDrawingJson());
				if(null == subCommentList){
					subCommentList = new ArrayList<Comment>();
				}
				subCommentList.add(existingComment);
				ReviewCacheManager.$.updateComments(subCommentList);
			}
		}

		return true;
	}

	private List<Comment> getThread(Comment comment, List<Comment> commentList) {
		List<Comment> subCommentList = new ArrayList<Comment>();
		for (Comment c : commentList) {
			if(!c.getId().equals(comment.getId()) && getTopParent(c).getId().equals(comment.getId())) {
				c = (Comment)Utils.deepClone(c); // Another copy
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

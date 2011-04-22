package org.davinci.server.review.persistence;

import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

import org.davinci.server.review.Comment;
import org.davinci.server.review.CommentsDocument;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.Utils;
import org.davinci.server.review.cache.ReviewCacheManager;

public class XmlCommentDaoImpl implements CommentDao {

	public boolean insertComments(List<Comment> commentList) throws Exception {
		if (null == commentList || commentList.isEmpty())
			return true;
		ReviewCacheManager.$.updateComments(commentList);

		return true;
	}

	public List<Comment> selectProjectComments(DavinciProject prj) {
		Unmarshaller unmarshaller = new Unmarshaller();
		CommentsDocument doc = unmarshaller.unmarshall(prj);
		return doc.getCommentList();
	}

	public synchronized boolean updateComment(List<Comment> commentList) throws Exception {
		if (commentList == null || commentList.isEmpty())
			return true;

		Comment existingComment;
		List<Comment> subCommentList = null;

		for (Comment comment : commentList) {
			existingComment = ReviewCacheManager.$.getComment(comment.getProject(), comment.getId());
			if (existingComment != null) {
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
					subCommentList = ReviewCacheManager.$.getCommentsByPageName(comment.getProject(), comment.getPageName());
					subCommentList = updateStatus(existingComment, subCommentList);
				}
				if (null == subCommentList) {
					subCommentList = new ArrayList<Comment>(1);
				}
				subCommentList.add(existingComment);
				ReviewCacheManager.$.updateComments(subCommentList);
			}
		}

		return true;
	}
	
	private Comment getTopParent(Comment comment){
		while(!Utils.isBlank(comment.getReplyTo())&&!"0".equals(comment.getReplyTo())){
			comment = ReviewCacheManager.$.getComment(comment.getProject(), comment.getReplyTo());
		}
		return comment;
	}

	private List<Comment> updateStatus(Comment comment, List<Comment> commentList) {
		// Update all the children status
		List<Comment> subCommentList = new ArrayList<Comment>();
		for (Comment c : commentList) {
			if (!c.getId().equals(comment.getId())&&
					getTopParent(c).getId().equals(comment.getId())) {
				c.setStatus(comment.getStatus());
				updateStatus(c, commentList);
				subCommentList.add(c);
			}
		}
		return subCommentList;
	}
}

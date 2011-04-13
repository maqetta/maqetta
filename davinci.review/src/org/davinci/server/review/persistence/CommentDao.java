package org.davinci.server.review.persistence;

import java.util.List;

import org.davinci.server.review.Comment;
import org.davinci.server.review.DavinciProject;

public interface CommentDao {
	/**
	 * Save a comment
	 * 
	 * @param comm
	 * @return True if the operation succeeds. False, otherwise.
	 */
	public boolean insertComments(List<Comment> commentList) throws Exception;

	public List<Comment> selectProjectComments(DavinciProject project);
	
	public boolean updateComment(List<Comment> commentList) throws Exception;
}

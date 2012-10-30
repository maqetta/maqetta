package org.davinci.server.review;

import java.io.Serializable;
import java.util.LinkedList;
import java.util.List;

import org.davinci.server.user.IDavinciProject;

public class CommentsDocument implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public static final String COMMENT = "comment";

	private IDavinciProject project;

	private List<Comment> commentList;

	public CommentsDocument(IDavinciProject project) {
		this.project = project;
		commentList = new LinkedList<Comment>();
	}

	public List<Comment> getCommentList() {
		return commentList;
	}

	public void setCommentList(List<Comment> commentList) {
		this.commentList = commentList;
	}

	public IDavinciProject getProject() {
		return project;
	}

	public void setProject(IDavinciProject project) {
		this.project = project;
	}

}

package org.davinci.server.review;

import java.io.Serializable;
import java.util.LinkedList;
import java.util.List;

public class CommentsDocument implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public static final String COMMENT = "comment";

	private DavinciProject project;

	private List<Comment> commentList;

	public CommentsDocument(DavinciProject project) {
		this.project = project;
		commentList = new LinkedList<Comment>();
	}

	public List<Comment> getCommentList() {
		return commentList;
	}

	public void setCommentList(List<Comment> commentList) {
		this.commentList = commentList;
	}

	public DavinciProject getProject() {
		return project;
	}

	public void setProject(DavinciProject project) {
		this.project = project;
	}

}

package org.davinci.server.review.persistence;

public class CommentDaoFactory {
	public static enum DaoType {
		XML
	};

	public static CommentDao getInstance(DaoType type) {
		switch (type) {
		case XML:
			return new XmlCommentDaoImpl();
		default:
			return null;
		}
	}
}

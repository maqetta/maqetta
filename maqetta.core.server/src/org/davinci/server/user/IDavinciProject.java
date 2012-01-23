package org.davinci.server.user;

import org.davinci.server.review.CommentsDocument;

public interface IDavinciProject {

    public abstract String getOwnerId();

    public abstract void setOwnerId(String ownerId);

    public abstract String getProjectName();

    public abstract void setProjectName(String projectName);

    public abstract String getCommentFilePath();

    public abstract CommentsDocument getCommentsDocument();

    public abstract void setCommentsDocument(CommentsDocument commentsDocument);

    public abstract int hashCode();

    public abstract boolean equals(Object j);

}
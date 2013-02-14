package org.davinci.server.user;

import java.io.IOException;

import org.davinci.server.review.CommentsDocument;
import org.maqetta.server.IStorage;

public interface IDavinciProject {

    public abstract String getOwnerId();

    public abstract void setOwnerId(String ownerId);

    public abstract String getProjectName();

    public abstract void setProjectName(String projectName);

    public abstract IStorage getCommentsFileStorage() throws IOException;

    public abstract CommentsDocument getCommentsDocument();

    public abstract void setCommentsDocument(CommentsDocument commentsDocument);

    public abstract int hashCode();

    public abstract boolean equals(Object j);

}
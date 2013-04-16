package org.davinci.server.review.user;

import java.io.IOException;
import java.util.List;

import org.davinci.server.review.Version;
import org.davinci.server.user.IUser;
import org.maqetta.server.IStorage;

public interface IDesignerUser {

    public abstract Version getVersion(String time);

    public abstract String getName();

    public abstract Version getLatestVersion();

    public abstract void setLatestVersion(Version latestVersion);

    public abstract void addVersion(Version version);

    public abstract List<Version> getVersions();

    public abstract void deleteVersion(String versionTime) throws IOException;

    public abstract IStorage getCommentingDirectory();

    public abstract IStorage getUserDirectory();

    public abstract IUser getRawUser();
    
    public abstract void setRawUser(IUser user);
    
    public abstract void rebuildWorkspace();

}
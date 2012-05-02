package org.davinci.server.review.user;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.server.review.Version;
import org.davinci.server.user.IDavinciProject;
import org.maqetta.server.IStorage;

public interface IReviewManager {

    public abstract void saveDraft(IDesignerUser user, Version version);

    public abstract void publish(IDesignerUser user, Version version);

    public abstract void saveVersionFile(IDesignerUser user);

    public abstract IDesignerUser getDesignerUser(String name);

    public abstract IStorage getBaseDirectory();

    public abstract ILibInfo[] getSystemLibs(IDavinciProject project);

    public abstract ILibInfo[] getVersionLib(IDavinciProject project,
            String version);

}
package org.davinci.server.review.user;

import java.io.IOException;

import org.davinci.server.review.Version;

public interface IReviewManager {

    public abstract void saveDraft(IDesignerUser user, Version version) throws IOException;

    public abstract void publish(IDesignerUser user, Version version) throws IOException;

    public abstract void saveVersionFile(IDesignerUser user) throws IOException;

    public abstract IDesignerUser getDesignerUser(String name) throws IOException;
}
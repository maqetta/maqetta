package org.davinci.server;

import org.davinci.server.user.User;

public class VWorkspaceRoot extends VDirectory {

    User user;

    public VWorkspaceRoot(User user) {
        super();

        this.user = user;

    }

    public String getPath(){
        return ".";

    }
}

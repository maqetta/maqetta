package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.user.User;

public class GetLibRoots extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {

        String id = req.getParameter("libId");
        String version = req.getParameter("version");
        String base = req.getParameter("base");

        String libRoot = user.getLibPath(id, version, base);
        if (libRoot != null) {
            responseString = "[{libRoot:{'root':'" + libRoot + "'}}]";
        } else {
            responseString = "null";
        }
    }
}

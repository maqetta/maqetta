package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;

public class GetFileInfo extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        String path = req.getParameter("path");
        IVResource file = user.getResource(path);
        StringBuffer sb = new StringBuffer("{");

        boolean isDirty = file.isDirty();
        sb.append("isDirty : ").append(isDirty);
        sb.append("}");
        responseString = sb.toString();
    }

}

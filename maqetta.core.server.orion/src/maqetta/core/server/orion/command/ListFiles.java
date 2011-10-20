package maqetta.core.server.orion.command;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.orion.Resource;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;

public class ListFiles extends Command {
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String path = req.getParameter("path");
        IVResource[] listDir = user.listFiles(path);
        this.responseString = Resource.vRsourcesToJson(listDir, false);
    }
}

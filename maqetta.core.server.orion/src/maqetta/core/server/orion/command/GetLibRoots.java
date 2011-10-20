package maqetta.core.server.orion.command;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class GetLibRoots extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {

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

package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.LibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;

public class GetUserLibs extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        // Library[] libs =
        // ServerManager.getServerManger().getLibraryManager().getAllLibraries();
        String base = req.getParameter("base");
        LibInfo[] installedLibs = user.getLibs(base);

        JSONWriter jsonWriter = new JSONWriter(true);
        jsonWriter.startObject().addFieldName("userLibs").startArray();
        LibraryManager libMan = ServerManager.getServerManger().getLibraryManager();
        for (int i = 0; i < installedLibs.length; i++) {
            String id = installedLibs[i].getId();
            String version = installedLibs[i].getVersion();
            Library lib = libMan.getLibrary(id, version);
            /* if library doesn't exist continue */
            if (lib == null) {
                continue;
            }
            jsonWriter.startObject().addField("id", id);
            jsonWriter.addField("version", version);
            jsonWriter.addField("metaRoot", lib.getMetadataPath());
            jsonWriter.addField("root", installedLibs[i].getVirtualRoot());
            jsonWriter.endObject();
        }
        jsonWriter.endArray().endObject();
        this.responseString = jsonWriter.getJSON();

    }
}
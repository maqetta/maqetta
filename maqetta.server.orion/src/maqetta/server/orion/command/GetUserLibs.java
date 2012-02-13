package maqetta.server.orion.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class GetUserLibs extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        // Library[] libs =
        // ServerManager.getServerManger().getLibraryManager().getAllLibraries();
     
        Library[] installedLibs = ServerManager.getServerManger().getLibraryManager().getAllLibraries();
        
      

        JSONWriter jsonWriter = new JSONWriter(true);
        jsonWriter.startObject().addFieldName("userLibs").startArray();
        ILibraryManager libMan = ServerManager.getServerManger().getLibraryManager();
        for (int i = 0; i < installedLibs.length; i++) {
            String id = installedLibs[i].getID();
            String version = installedLibs[i].getVersion();
            Library lib = libMan.getLibrary(id, version);
            /* if library doesn't exist continue */
            if (lib == null) {
                continue;
            }
            jsonWriter.startObject().addField("id", id);
            jsonWriter.addField("version", version);
            jsonWriter.addField("metaRoot", lib.getMetadataPath());
            if( installedLibs[i].getDefaultRoot()!=null)
            	jsonWriter.addField("root", installedLibs[i].getDefaultRoot());
            jsonWriter.endObject();
        }
        jsonWriter.endArray().endObject();
        this.responseString = jsonWriter.getJSON();

    }
}
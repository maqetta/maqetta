package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class ListLibs extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        Library[] libs = ServerManager.getServerManager().getLibraryManager().getAllLibraries();

        JSONWriter jsonWriter = new JSONWriter(true);
        jsonWriter.startObject().addFieldName("userLibs").startArray();
        for (int i = 0; i < libs.length; i++) {
            String id = libs[i].getID();
            String version = libs[i].getVersion();
            jsonWriter.startObject().addField("id", id);
            jsonWriter.addField("version", version);
            jsonWriter.addField("root", libs[i].getDefaultRoot());
            String required = libs[i].getRequired();
            jsonWriter.addField("required", required!=null || (Boolean.parseBoolean(required)?true:false));
            jsonWriter.addField("hasSource", libs[i].getSourcePath()!=null);
            jsonWriter.endObject();
        }
        jsonWriter.endArray().endObject();
        this.responseString = jsonWriter.getJSON();
        resp.setContentType("application/json;charset=UTF-8");
    }

}

package maqetta.core.server.standalone.command;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;

public class SetPreferences extends Command {


    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String id = req.getParameter("id");
        String base = req.getParameter("base");
        
        File settingsDir = user.getWorkbenchSettings(base);
        File settingsFile = new File(settingsDir, id + IDavinciServerConstants.SETTINGS_EXTENSION);
        
        if(! user.isValid(settingsFile.getAbsolutePath()) ) return;
        
        if (!settingsFile.exists()) {
            settingsFile.createNewFile();
        }
        OutputStream os = new BufferedOutputStream(new FileOutputStream(settingsFile));
        Command.transferStreams(req.getInputStream(), os, false);
    }

}

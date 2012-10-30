package maqetta.core.server.command;

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
import org.maqetta.server.IStorage;

public class SetPreferences extends Command {


    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String id = req.getParameter("id");
        String base = req.getParameter("base");
        
        IStorage settingsDir = user.getWorkbenchSettings(base);
        IStorage settingsFile = settingsDir.newInstance(settingsDir, id + IDavinciServerConstants.SETTINGS_EXTENSION);
        
        if(! user.isValid(settingsFile.getAbsolutePath()) ) return;
        
        if (!settingsFile.exists()) {
            settingsFile.createNewFile();
        }
        OutputStream os = new BufferedOutputStream(settingsFile.getOutputStream());
        Command.transferStreams(req.getInputStream(), os, false);
    }

}

package maqetta.core.server.command;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;

public class SetWorkbenchState extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        IStorage settingsDir = user.getWorkbenchSettings();
        IStorage settingsFile = settingsDir.newInstance(settingsDir, IDavinciServerConstants.WORKBENCH_STATE_FILE);
        if (!user.isValid(settingsFile.getAbsolutePath())) {
        	return;
        }
        if (settingsFile.exists()) {
        	settingsFile.delete();
        }
        settingsFile.createNewFile();
        OutputStream os = new BufferedOutputStream(settingsFile.getOutputStream());
        Command.transferStreams(req.getInputStream(), os, false);
    }

}

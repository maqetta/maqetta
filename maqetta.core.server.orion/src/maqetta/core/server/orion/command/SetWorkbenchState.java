package maqetta.core.server.orion.command;
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

public class SetWorkbenchState extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        File settingsDir = user.getWorkbenchSettings();
        File settingsFile = new File(settingsDir, IDavinciServerConstants.WORKBENCH_STATE_FILE);
        if (!settingsFile.exists()) {
            settingsFile.createNewFile();
        }
        OutputStream os = new BufferedOutputStream(new FileOutputStream(settingsFile));
        Command.transferStreams(req.getInputStream(), os, false);
    }

}

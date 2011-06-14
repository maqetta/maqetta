package org.davinci.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.user.User;

public abstract class Command {

    protected String errorString;
    protected String responseString;

    abstract public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException;

    public String getErrorString() {
        return errorString;
    }

    public String getResponse() {
        return responseString;
    }

    public void init() {
        this.errorString = null;
        this.responseString = null;

    }

    public static File getWorkingCopy(File file) {
        File parent = file.getParentFile();
        File workingCopy = new File(parent, file.getName() + IDavinciServerConstants.WORKING_COPY_EXTENSION);
        return workingCopy;
    }

    protected static final void transferStreams(InputStream source, OutputStream destination, boolean closeInput) throws IOException {
        byte[] buffer = new byte[8192];
        try {
            while (true) {
                int bytesRead = -1;
                bytesRead = source.read(buffer);
                if (bytesRead == -1) {
                    break;
                }
                destination.write(buffer, 0, bytesRead);
            }
        } finally {
            if (closeInput) {
                source.close();
            } else {
                destination.close();
            }
        }
    }
}

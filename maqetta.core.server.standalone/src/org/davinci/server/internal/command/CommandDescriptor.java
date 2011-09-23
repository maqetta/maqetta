package org.davinci.server.internal.command;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;

public class CommandDescriptor {

    private IConfigurationElement configElement;
    Command                       command;
    String                        path;
    boolean                       isPut;
    boolean                       isNoLogin;

    public CommandDescriptor(IConfigurationElement configurationElement) {
        this.configElement = configurationElement;
        this.path = configurationElement.getAttribute(IDavinciServerConstants.EP_ATTR_COMMAND_PATH);
        String str = configurationElement.getAttribute(IDavinciServerConstants.EP_ATTR_COMMAND_ISPUT);
        this.isPut = str != null && str.equalsIgnoreCase("true");
        str = configurationElement.getAttribute(IDavinciServerConstants.EP_ATTR_COMMAND_NOLOGIN);
        this.isNoLogin = str != null && str.equalsIgnoreCase("true");
    }

    public String getPath() {
        return path;
    }

    public boolean isPut() {
        return isPut;
    }

    public boolean isNoLogin() {
        return isNoLogin;
    }

    public Command getCommand() {

        if (this.command == null) {
            try {
                this.command = (Command) this.configElement.createExecutableExtension(IDavinciServerConstants.EP_ATTR_COMMAND_CLASS);
            } catch (CoreException e) {
                e.printStackTrace();
                return null;
            }
        }
        return this.command;

    }

}

package org.davinci.server;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.internal.Activator;
import org.davinci.server.internal.command.CommandDescriptor;
import org.davinci.server.user.User;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;

@SuppressWarnings("serial")
public class DavinciCommandServlet extends HttpServlet {

    private HashMap commands    = new HashMap();
    private boolean initialized = false;

    public DavinciCommandServlet() {
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        if (!initialized) {
            initialize();
        }
        String pathInfo = req.getPathInfo();
        if (pathInfo.startsWith("/")) {
            pathInfo = pathInfo.substring(1);
        }

        CommandDescriptor commandDescriptor = (CommandDescriptor) this.commands.get(pathInfo);
        if (commandDescriptor == null || commandDescriptor.isPut()) {
            throw new java.lang.AssertionError(new String("commandDescriptor is null or is Put in Get processing"));
        }
        User user = checkLogin(req, resp, commandDescriptor);
        if (user == null && !commandDescriptor.isNoLogin()) {
            return;
        }

        Command command = commandDescriptor.getCommand();
        command.init();

        command.handleCommand(req, resp, user);
        if (command.getErrorString() != null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, command.getErrorString());
        } else if (command.getResponse() != null) {
            ServletOutputStream stream = resp.getOutputStream();
            stream.print(command.getResponse());

        }
    }

    private User checkLogin(HttpServletRequest req, HttpServletResponse resp, CommandDescriptor commandDescriptor) throws IOException {

        User user = (User) req.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
        if (user == null) {
            if (ServerManager.LOCAL_INSTALL) {
                user = ServerManager.getServerManger().getUserManager().getSingleUser();
                req.getSession().setAttribute(IDavinciServerConstants.SESSION_USER, user);
            } else {
                if (!commandDescriptor.isNoLogin()) {
                    resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return null;
                }
            }

        }
        return user;
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if (!initialized) {
            initialize();
        }
        String pathInfo = req.getPathInfo();
        if (pathInfo.startsWith("/")) {
            pathInfo = pathInfo.substring(1);
        }

        CommandDescriptor commandDescriptor = (CommandDescriptor) this.commands.get(pathInfo);
        if (commandDescriptor == null || !commandDescriptor.isPut()) {
            throw new java.lang.AssertionError(new String("commandDescriptor is null or is not Put in Put processing"));
        }

        User user = checkLogin(req, resp, commandDescriptor);
        if (user == null && !commandDescriptor.isNoLogin()) {
            return;
        }
        Command command = commandDescriptor.getCommand();
        command.init();

        command.handleCommand(req, resp, user);

    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // TODO Auto-generated method stub
        super.service(req, resp);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse resp) throws ServletException, IOException {
        if (!initialized) {
            initialize();
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo.startsWith("/")) {
            pathInfo = pathInfo.substring(1);
        }

        User user = (User) request.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
        CommandDescriptor commandDescriptor = (CommandDescriptor) this.commands.get(pathInfo);
        if (commandDescriptor == null || commandDescriptor.isPut()) {
            throw new java.lang.AssertionError(new String("commandDescriptor is null or is Put in Post processing"));
        }
        if (user == null) {
            if (!commandDescriptor.isNoLogin()) {
                resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

        }
        Command command = commandDescriptor.getCommand();
        command.init();

        command.handleCommand(request, resp, user);
        if (command.getErrorString() != null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, command.getErrorString());
        } else if (command.getResponse() != null) {
            ServletOutputStream stream = resp.getOutputStream();
            stream.print(command.getResponse());

        }
    }

    void loadCommands() {
        IExtensionRegistry registry = Activator.getActivator().getRegistry();
        if (registry != null) {
            IExtensionPoint point = registry.getExtensionPoint(IDavinciServerConstants.BUNDLE_ID, IDavinciServerConstants.EXTENSION_POINT_COMMAND);

            if (point != null) {
                IExtension[] extensions = point.getExtensions();
                for (int i = 0; i < extensions.length; i++) {
                    IConfigurationElement[] elements = extensions[i].getConfigurationElements();
                    for (int j = 0; j < elements.length; j++) {
                        if (elements[j].getName().equals(IDavinciServerConstants.EP_TAG_COMMAND)) {
                            CommandDescriptor cmd = new CommandDescriptor(elements[j]);
                            this.commands.put(cmd.getPath(), cmd);
                        }
                    }
                }
            }
        }
    }

    private void initialize() {
        if (commands.isEmpty()) {
            this.loadCommands();
        }
        if (ServerManager.getServerManger() == null) {
            ServerManager.createServerManger(getServletConfig());
        }
        this.initialized = true;
    }

}

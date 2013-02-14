package org.maqetta.server;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.internal.Activator;
import org.davinci.server.internal.command.CommandDescriptor;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtension;
import org.eclipse.core.runtime.IExtensionPoint;
import org.eclipse.core.runtime.IExtensionRegistry;

@SuppressWarnings("serial")
public class DavinciCommandServlet extends HttpServlet {

	static private Logger theLogger = Logger.getLogger(DavinciCommandServlet.class.getName());

	private HashMap<String, CommandDescriptor> commands = new HashMap<String, CommandDescriptor>();
    private boolean initialized = false;

    public DavinciCommandServlet() {
    }

	private void log(HttpServletRequest req, String method, Throwable t) {
		theLogger.logp(Level.SEVERE, DavinciCommandServlet.class.getName(), method, "Unhandled Exception", t);
		theLogger.log(Level.INFO, "RequestURL: " + req.getRequestURL().toString());
		String query = req.getQueryString();
		if (query != null) {
			theLogger.log(Level.INFO, "Query: " + query);
		}
		Enumeration<String> names = req.getHeaderNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			String header = req.getHeader(name);
			if (header != null) {
				theLogger.log(Level.INFO, name + ": " + header);
			}
		}
	}

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    	try {
    		resp.setCharacterEncoding("utf-8");
	        if (!initialized) {
	            initialize();
	        }
	        String pathInfo = req.getPathInfo();
	        if (pathInfo.startsWith("/")) {
	            pathInfo = pathInfo.substring(1);
	        }
	
	        CommandDescriptor commandDescriptor = this.commands.get(pathInfo);
	        if (commandDescriptor == null || commandDescriptor.isPut()) {
	            throw new AssertionError(new String("commandDescriptor is null or is Put in Get processing"));
	        }
	        IUser user = checkLogin(req, resp, commandDescriptor);
	        if (user == null && !commandDescriptor.isNoLogin()) {
	            return;
	        }
	
	        Command command = commandDescriptor.getCommand();
	        command.init();
	
	        command.handleCommand(req, resp, user);
	        if (command.getErrorString() != null) {
	            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, command.getErrorString());
	        } else if (command.getResponse() != null) {
	            OutputStream stream = resp.getOutputStream();
	            stream.write(command.getResponse().getBytes("utf-8"));
	        }
    	} catch (RuntimeException re) {
    		log(req, "doGet", re);
    		throw re;
    	} catch (IOException ioe) {
    		log(req, "doGet", ioe);
    		throw ioe;
    	} catch (Error e) {
    		log(req, "doGet", e);
    		throw e;
    	}
    }

    private IUser checkLogin(HttpServletRequest req, HttpServletResponse resp, CommandDescriptor commandDescriptor) throws IOException {

        IUser user = ServerManager.getServerManager().getUserManager().getUser(req);
        if (user == null) {
            if (!ServerManager.LOCAL_INSTALL &&!commandDescriptor.isNoLogin()) {
                    resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return null;
            }
        }
        return user;
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    	try {
	        if (!initialized) {
	            initialize();
	        }
	        String pathInfo = req.getPathInfo();
	        if (pathInfo.startsWith("/")) {
	            pathInfo = pathInfo.substring(1);
	        }
	
	        CommandDescriptor commandDescriptor = this.commands.get(pathInfo);
	        if (commandDescriptor == null || !commandDescriptor.isPut()) {
	            throw new AssertionError(new String("commandDescriptor is null or is not Put in Put processing"));
	        }
	
	        IUser user = checkLogin(req, resp, commandDescriptor);
	        if (user == null && !commandDescriptor.isNoLogin()) {
	            return;
	        }
	        Command command = commandDescriptor.getCommand();
	        command.init();
	
	        command.handleCommand(req, resp, user);
    	} catch (RuntimeException re) {
    		log(req, "doPut", re);
    		throw re;
    	} catch (IOException ioe) {
    		log(req, "doPut", ioe);
    		throw ioe;
    	} catch (Error e) {
    		log(req, "doPut", e);
    		throw e;
    	}
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    	try {
	        if (!initialized) {
	            initialize();
	        }
	
	        String pathInfo = req.getPathInfo();
	        if (pathInfo.startsWith("/")) {
	            pathInfo = pathInfo.substring(1);
	        }
	
	      
	        CommandDescriptor commandDescriptor = this.commands.get(pathInfo);
	        if (commandDescriptor == null || commandDescriptor.isPut()) {
	            throw new java.lang.AssertionError(new String("commandDescriptor is null or is Put in Post processing"));
	        }
	        IUser user = checkLogin(req, resp, commandDescriptor);
	        if (user == null) {
	            if (!commandDescriptor.isNoLogin()) {
	                resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
	                return;
	            }
	        }
	        Command command = commandDescriptor.getCommand();
	        command.init();
	
	        command.handleCommand(req, resp, user);
	        if (command.getErrorString() != null) {
	            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, command.getErrorString());
	        } else if (command.getResponse() != null) {
	            OutputStream stream = resp.getOutputStream();
	            stream.write(command.getResponse().getBytes("utf-8"));
	        }
    	} catch(RuntimeException re) {
    		log(req, "doPost", re);
    		throw re;
    	} catch (IOException ioe) {
    		log(req, "doPost", ioe);
    		throw ioe;
    	} catch (Error e) {
    		log(req, "doPost", e);
    		throw e;
    	}
    }

    private void loadCommands() {
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

        this.initialized = true;
    }

}

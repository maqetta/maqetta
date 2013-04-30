package org.maqetta.server;

import java.io.EOFException;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

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

	private void log(HttpServletRequest req, String method, Throwable t, IUser user) {
		theLogger.logp(Level.SEVERE, DavinciCommandServlet.class.getName(), method, "Unhandled Exception", t);
		String log = "RequestURL: " + req.getRequestURL().toString();

		if (user == null) {
			user = ServerManager.getServerManager().getUserManager().getUser(req);
		}
		if (user != null) {
			log += "\nUser: uid=" + user.getUserID();
			String email = user.getPerson().getEmail();
			if (email != null) {
				log += " email=" + email;
			}
		}

		String query = req.getQueryString();
		if (query != null) {
			log += "\nQuery: " + query;
		}

		Enumeration<String> names = req.getHeaderNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			String header = req.getHeader(name);
			if (header != null) {
				log += "\n" + name + ": " + header;
			}
		}
		theLogger.info(log);
	}

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		IUser user = null;
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
	        if (commandDescriptor.isPut()) {
	            throw new AssertionError(new String("commandDescriptor is Put in doGet"));
	        }
	        user = checkLogin(req, resp, commandDescriptor);
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
    		log(req, "doGet", re, user);
    		throw re;
    	} catch (EOFException eof) {
    		// user cancelled request
    		throw eof;
    	} catch (IOException ioe) {
    		log(req, "doGet", ioe, user);
    		throw ioe;
    	} catch (Error e) {
    		log(req, "doGet", e, user);
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
    	IUser user = null;
    	try {
	        if (!initialized) {
	            initialize();
	        }
	        String pathInfo = req.getPathInfo();
	        if (pathInfo.startsWith("/")) {
	            pathInfo = pathInfo.substring(1);
	        }
	
	        CommandDescriptor commandDescriptor = this.commands.get(pathInfo);
	        if (!commandDescriptor.isPut()) {
	            throw new AssertionError(new String("commandDescriptor is not Put in doPut"));
	        }
	
	        user = checkLogin(req, resp, commandDescriptor);
	        if (user == null && !commandDescriptor.isNoLogin()) {
	            return;
	        }
	        Command command = commandDescriptor.getCommand();
	        command.init();
	
	        command.handleCommand(req, resp, user);
    	} catch (RuntimeException re) {
    		log(req, "doPut", re, user);
    		throw re;
    	} catch (IOException ioe) {
    		log(req, "doPut", ioe, user);
    		throw ioe;
    	} catch (Error e) {
    		log(req, "doPut", e, user);
    		throw e;
    	}
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    	IUser user = null;
    	try {
	        if (!initialized) {
	            initialize();
	        }
	
	        String pathInfo = req.getPathInfo();
	        if (pathInfo.startsWith("/")) {
	            pathInfo = pathInfo.substring(1);
	        }
	
	      
	        CommandDescriptor commandDescriptor = this.commands.get(pathInfo);
	        if (commandDescriptor.isPut()) {
	            throw new AssertionError(new String("commandDescriptor is Put in doPost"));
	        }
	        user = checkLogin(req, resp, commandDescriptor);
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
    		log(req, "doPost", re, user);
    		throw re;
    	} catch (IOException ioe) {
    		log(req, "doPost", ioe, user);
    		throw ioe;
    	} catch (Error e) {
    		log(req, "doPost", e, user);
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

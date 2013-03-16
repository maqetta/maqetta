/*******************************************************************************
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package maqetta.server.orion.user;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.orion.internal.server.servlets.ProtocolConstants;
import org.eclipse.orion.internal.server.servlets.workspace.WebUser;
import org.eclipse.orion.server.core.resources.Base64Counter;
import org.eclipse.orion.server.servlets.OrionServlet;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.User;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.eclipse.orion.server.useradmin.UserServiceHelper;
import org.json.JSONException;
import org.json.JSONObject;

// POST /users/       			creates a new user
// POST /login/form   			login user
// POST /useremailconfirmation	password reset	[1]
//
// Intercepts authentication requests and updates the request parameters for use by Orion.
//
// The Orion code expects the following parameters when registering a new user or handling login:
//        login: a unique, alphanumeric username
//        password:
//        email: (optional, registration only) unique email
//        name: (optional, registration only) display name
//
// For Maqetta, we don't want to use 2 different unique identifiers ("login" and "email"). Plus,
// we have existing users whose "login" is an email and have no value for "email".  Maqetta requests
// will come with the following parameters (as of M10):
//        email: unique email
//        password:
//        name: (optional, registration only) display name
//
// Here, we intercept these requests and properly set `login` for use by the Orion code.
//
// Also, if the 'name' parameter is not specified, we default to using the value of 'email'.  This
// differs from Orion, which sets the former to the value of 'login'.  In our case, that would
// result in 'name' containing a seemingly random alphanumeric sequence, which isn't very useful.
//
// [1] Orion's '/useremailconfirmation' REST API seems to be able to only take an 'email' value,
//     without the use of 'login'.  However, in at least Orion v1.0, there seems to be a bug with
//     the 'email' handling.  Works well if we set the 'login' value.
//
//
// NOTE: This class works in conjunction with LoginFixUpDecorator.  Keep the two in sync.

@SuppressWarnings("restriction")
public class LoginFixUpFilter implements Filter {

	private static final Base64Counter userCounter = new Base64Counter();

	public static final String USERS_SERVLET_ALIAS = "/users";
	public static final String LOGIN_SERVLET_ALIAS = "/login";
	public static final String EMAILCONF_SERVLET_ALIAS = "/useremailconfirmation";

	public static final String ID_PREFIX = "00MaqTempId00";

	static final private Logger theLogger = Logger.getLogger(LoginFixUpFilter.class.getName());

	public void init(FilterConfig filterConfig) throws ServletException {
	}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;

		if ("POST".equals(httpRequest.getMethod())) { //$NON-NLS-1$
			String servletPath = httpRequest.getServletPath();
			String pathInfo = httpRequest.getPathInfo();
			if (servletPath.equals(USERS_SERVLET_ALIAS) && pathInfo == null) {
				if (handleRegistration(httpRequest, httpResponse, chain)) {
					return;
				}
			} else if (servletPath.equals(LOGIN_SERVLET_ALIAS) && pathInfo.equals("/form")) { //$NON-NLS-1$
				if (handleLogin(httpRequest, httpResponse, chain)) {
					return;
				}
			} else if (servletPath.equals(EMAILCONF_SERVLET_ALIAS) && pathInfo == null) {
				if (handleEmailConfig(httpRequest, httpResponse, chain)) {
					return;
				}
			}
		}

		chain.doFilter(request, response);
	}

	public void destroy() {
	}

	private boolean handleRegistration(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		String login = request.getParameter(UserConstants.KEY_LOGIN);
		if (login != null && login.length() > 0) {
			return false;
		}

		IOrionCredentialsService userAdmin = getUserAdmin();

		// modify request with generated `login` parameter
		RequestWrapper modifiedRequest = new RequestWrapper(request);
		modifiedRequest.setParameter(UserConstants.KEY_LOGIN, nextUserId(userAdmin));

		// check if 'name' parameter is set
		String email = request.getParameter(UserConstants.KEY_EMAIL);
		String name = request.getParameter(ProtocolConstants.KEY_NAME);
		if (name == null || name.length() == 0) {
			// If 'name' isn't set, default to 'email'. This differs from Orion, which defaults
			// to using 'login'.
			modifiedRequest.setParameter(ProtocolConstants.KEY_NAME, email);
		}

		// continue with filter chain
		chain.doFilter(modifiedRequest, response);

		// reset `login` to be the same as the UID
		User user = userAdmin.getUser(UserConstants.KEY_EMAIL, email);
		if (user != null) {
			String value = user.getLogin();
			if (value.startsWith(ID_PREFIX)) {
				String uid = user.getUid();

				// update credentials service
				user.setLogin(uid);
				userAdmin.updateUser(uid, user);  // errors logged by Orion

				// update user object for workspace service
				WebUser webUser = WebUser.fromUserId(uid);
				webUser.setUserName(uid);
				try {
					webUser.save();
				} catch (CoreException e) {
					throw new ServletException("Could not save WebUser", e);
				}
			}
		}

		return true;
	}

	private boolean handleLogin(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		String login = request.getParameter(UserConstants.KEY_LOGIN);
		if (login != null && login.length() > 0) {
			return false;
		}

		String email = request.getParameter(UserConstants.KEY_EMAIL);
		IOrionCredentialsService userAdmin = getUserAdmin();
		User user = userAdmin.getUser(UserConstants.KEY_EMAIL, email);
		if (user == null) {
			// users registered before M10 will have an email for "login" and no value for "email"
			user = userAdmin.getUser(UserConstants.KEY_LOGIN, email);
			if (user != null) {
				user = fixOldUser(userAdmin, user);
			}

			if (user == null) {  // also checks for failure from `fixOldUser()`
				theLogger.finest("User object not found for " + email +
						". Perhaps that user isn't registered yet.");
				return false;
			}
		}

		// modify request to add correct `login` parameter
		RequestWrapper modifiedRequest = new RequestWrapper(request);
		modifiedRequest.setParameter(UserConstants.KEY_LOGIN, user.getLogin());

		// continue with filter chain
		chain.doFilter(modifiedRequest, response);
		return true;
	}

	private boolean handleEmailConfig(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		JSONObject data;
		String email;
		String login;
		try {
			data = OrionServlet.readJSONRequest(request);
			email = data.getString(UserConstants.KEY_EMAIL);
			login = data.getString(UserConstants.KEY_LOGIN);
		} catch (JSONException e) {
			theLogger.log(Level.SEVERE, "Could not parse json request", e);
			return false;
		}
		
		if (login != null && login.length() > 0) {
			return false;
		}

		IOrionCredentialsService userAdmin = getUserAdmin();
		User user = userAdmin.getUser(UserConstants.KEY_EMAIL, email);
		if (user == null) {
			return false;
		}

		// modify request data to include correct 'login' value
		try {
			data.put(UserConstants.KEY_LOGIN, user.getLogin());
		} catch (JSONException e) {
			theLogger.log(Level.SEVERE, "Could not edit JSONObject", e);
			return false;
		}
		RequestWrapper modifiedRequest = new RequestWrapper(request);
		modifiedRequest.setData(data.toString());

		// continue with filter chain
		chain.doFilter(modifiedRequest, response);
		return true;
	}

	private IOrionCredentialsService getUserAdmin() {
		return UserServiceHelper.getDefault().getUserStore();
	}

	public static String nextUserId(IOrionCredentialsService userAdmin) {
		synchronized (userCounter) {
			String candidate;
			do {
				candidate = ID_PREFIX + userCounter.toString();
				userCounter.increment();
			} while (userAdmin.getUser(UserConstants.KEY_LOGIN, candidate) != null);
			return candidate;
		}
	}

	private User fixOldUser(IOrionCredentialsService userAdmin, User user) {
		// get old values
		String email = user.getLogin();
		String name = user.getName();
		String uid = user.getUid();

		// set new values
		user.setLogin(uid);
		user.setEmail(email);
		if (name.length() == 0) {
			// default 'name' to same value as 'email'
			user.setName(email);
		}

		// update
		IStatus status = userAdmin.updateUser(uid, user);  // errors logged by Orion
		if (!status.isOK()) {
			return null;
		}

		return user;
	}

	//============================================================================================//
	
	class RequestWrapper extends HttpServletRequestWrapper {

		private HashMap<String, String[]> updatedMap = new HashMap<String, String[]>();
		private String data = null;

		public RequestWrapper(HttpServletRequest request) {
			super(request);
			
			updatedMap.putAll(request.getParameterMap());
		}

		/* (non-Javadoc)
		 * @see javax.servlet.ServletRequestWrapper#getParameter(java.lang.String)
		 */
		@Override
		public String getParameter(String name) {
			String[] values = updatedMap.get(name);
			if (values != null && values.length > 0) {
				return values[0];
			}
			return null;
		}

		/* (non-Javadoc)
		 * @see javax.servlet.ServletRequestWrapper#getParameterMap()
		 */
		@Override
		public Map<String, String[]> getParameterMap() {
			return updatedMap;
		}

		/* (non-Javadoc)
		 * @see javax.servlet.ServletRequestWrapper#getParameterNames()
		 */
		@Override
		public Enumeration<String> getParameterNames() {
			return Collections.enumeration(updatedMap.keySet());
		}

		/* (non-Javadoc)
		 * @see javax.servlet.ServletRequestWrapper#getParameterValues(java.lang.String)
		 */
		@Override
		public String[] getParameterValues(String name) {
			return updatedMap.get(name);
		}

		/* (non-Javadoc)
		 * @see javax.servlet.ServletRequestWrapper#getInputStream()
		 */
		@Override
		public ServletInputStream getInputStream() throws IOException {
			if (data == null) {
				return super.getInputStream();
			}

			String charset = getRequest().getCharacterEncoding();
			if (charset == null) {
				charset = Charset.defaultCharset().name();
			}
			byte[] bytes = data.getBytes(charset);
			final ByteArrayInputStream in = new ByteArrayInputStream(bytes);

			return new ServletInputStream() {
				
				@Override
				public int read() throws IOException {
					return in.read();
				}
			};
		}

		/* (non-Javadoc)
		 * @see javax.servlet.ServletRequestWrapper#getReader()
		 */
		@Override
		public BufferedReader getReader() throws IOException {
			if (data == null) {
				return super.getReader();
			}
			return new BufferedReader(new InputStreamReader(getInputStream()));
		}

		public void setParameter(String name, String value) {
			String[] values = { value };
			updatedMap.put(name, values);
		}
		
		public void setData(String newData) {
			data  = newData;
		}

	}
}

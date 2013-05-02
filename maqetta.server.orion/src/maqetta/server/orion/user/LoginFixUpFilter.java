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
import java.util.Random;
import java.util.UUID;
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

import org.eclipse.core.runtime.IStatus;
import org.eclipse.orion.internal.server.servlets.ProtocolConstants;
import org.eclipse.orion.server.servlets.OrionServlet;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.User;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.eclipse.orion.server.useradmin.UserServiceHelper;
import org.json.JSONException;
import org.json.JSONObject;

// POST /users/                 creates a new user
// POST /login/form             login user
// POST /useremailconfirmation  password reset
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
// Password reset for pre-M10 accounts won't work, since the email is stored in the 'login' value of
// the user's account, and the 'email' is blank. We fix that here.

@SuppressWarnings("restriction")
public class LoginFixUpFilter implements Filter {

	public static final String USERS_SERVLET_ALIAS = "/users";
	public static final String LOGIN_SERVLET_ALIAS = "/login";
	public static final String EMAILCONF_SERVLET_ALIAS = "/useremailconfirmation";

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
				handleEmailConfig(httpRequest, httpResponse, chain);
				return;
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

		String email = request.getParameter(UserConstants.KEY_EMAIL);
		String name = request.getParameter(ProtocolConstants.KEY_NAME);

		IOrionCredentialsService userAdmin = getUserAdmin();

		// modify request with generated `login` parameter
		RequestWrapper modifiedRequest = new RequestWrapper(request);
		modifiedRequest.setParameter(UserConstants.KEY_LOGIN, generateUserId(userAdmin, email));

		// check if 'name' parameter is set
		if (name == null || name.length() == 0) {
			// If 'name' isn't set, default to 'email'. This differs from Orion, which defaults
			// to using 'login'.
			modifiedRequest.setParameter(ProtocolConstants.KEY_NAME, email);
		}

		// continue with filter chain
		chain.doFilter(modifiedRequest, response);
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

	private void handleEmailConfig(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		JSONObject data = null;
		try {
			data = OrionServlet.readJSONRequest(request);
			String email = data.getString(UserConstants.KEY_EMAIL);
			String login = data.getString(UserConstants.KEY_LOGIN);
			
			if (login != null && login.length() > 0) {
				return;
			}

			IOrionCredentialsService userAdmin = getUserAdmin();
			User user = userAdmin.getUser(UserConstants.KEY_EMAIL, email);
			if (user != null) {
				// a user exists with this email; let Orion handle the rest
				return;
			}

			// Pre-M10 accounts will store the email as 'login', while 'email' will be blank. Check
			// for that here.
			user = userAdmin.getUser(UserConstants.KEY_LOGIN, email);
			if (user == null) {
				// no such user; continue on to Orion
				return;
			}

			// let's fix up the user data now, so he/she has an 'email' value
			user = fixOldUser(userAdmin, user);
		} catch (JSONException e) {
			theLogger.log(Level.SEVERE, "Could not parse json request", e);
			return;
		} finally {
			// POST data can only be read once, which we did above.  Create a new request, set the
			// data and pass that on.
			RequestWrapper modifiedRequest = new RequestWrapper(request);
			modifiedRequest.setData(data != null ? data.toString() : "");

			// continue with filter chain
			chain.doFilter(modifiedRequest, response);
		}
	}

	private IOrionCredentialsService getUserAdmin() {
		return UserServiceHelper.getDefault().getUserStore();
	}

	public static String generateUserId(IOrionCredentialsService userAdmin, String email) {
		// Try to use the first part of user's email address, removing common non-alphanumeric
		// characters.
		String login = email.split("@", 2)[0];
		login = login.replaceAll("[.\\-_+]", "");
		if (login.length() > USERNAME_MAX_LENGTH) {
			login = login.substring(0, USERNAME_MAX_LENGTH);
		}

		// if it's still a valid login, then return one that doesn't collide with existing one
		if (validateLogin(login)) {
			int counter = 0;
			String candidate = login;
			while (userAdmin.getUser(UserConstants.KEY_LOGIN, candidate) != null) {
				candidate = login + ++counter;
			}
			return candidate;
		}

		// login still has some validation issues; just create a "random" login name
		int randlen = new Random().nextInt(USERNAME_MAX_LENGTH - USERNAME_MIN_LENGTH + 1) + USERNAME_MIN_LENGTH;
		do {
			login = UUID.randomUUID().toString().replaceAll("-","").substring(0, randlen);
		} while (userAdmin.getUser(UserConstants.KEY_LOGIN, login) != null);
		return login;
	}

	public User fixOldUser(IOrionCredentialsService userAdmin, User user) {
		// get old values
		String email = user.getLogin();
		String name = user.getName();
		String uid = user.getUid();

		// set new values
		user.setLogin(generateUserId(userAdmin, email));
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

		// Set email as confirmed -- pre-M10 users' emails were confirmed by Maqetta, so
		// should be fine setting it here for Orion.
		// Need to do a seperate updateUser() call unfortunately, since we changed the email above.
		user.confirmEmail();
		userAdmin.updateUser(uid, user);  // errors logged by Orion
		if (!status.isOK()) {
			return null;
		}

		return user;
	}

	//============================================================================================//
	//  The following are copied from Orion's UserHandlerV1.java
	//============================================================================================//
	/**
	 * The minimum length of a username.
	 */
	private static final int USERNAME_MIN_LENGTH = 3;
	/**
	 * The maximum length of a username.
	 */
	private static final int USERNAME_MAX_LENGTH = 20;
	/**
	 * Validates that the provided login is valid. Login must consistent of alphanumeric characters only for now.
	 * @return <code>null</code> if the login is valid, and otherwise a string message stating the reason
	 * why it is not valid.
	 */
	private static boolean /*String*/ validateLogin(String login) {
		if (login == null || login.length() == 0)
			return false /*"User login not specified"*/;
		int length = login.length();
		if (length < USERNAME_MIN_LENGTH)
			return false /*NLS.bind("Username must contain at least {0} characters", USERNAME_MIN_LENGTH)*/;
		if (length > USERNAME_MAX_LENGTH)
			return false /*NLS.bind("Username must contain no more than {0} characters", USERNAME_MAX_LENGTH)*/;
		if (login.equals("ultramegatron"))
			return false /*"Nice try, Mark"*/;

		for (int i = 0; i < length; i++) {
			if (!Character.isLetterOrDigit(login.charAt(i)))
				return false /*NLS.bind("Username {0} contains invalid character ''{1}''", login, login.charAt(i))*/;
		}
		return true /*null*/;
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

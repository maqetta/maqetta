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

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.orion.server.core.resources.Base64Counter;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.User;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.eclipse.orion.server.useradmin.UserServiceHelper;

// POST /users/       creates a new user
// POST /login/form   login user
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

@SuppressWarnings("restriction")
public class LoginFixUpFilter implements Filter {

	private static final Base64Counter userCounter = new Base64Counter();

	private static final String USERS_SERVLET_ALIAS = "/users";
	private static final String LOGIN_SERVLET_ALIAS = "/login";

	private static final String ID_TEMPLATE = "00MaqTempId00";

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
		IOrionCredentialsService userAdmin = getUserAdmin();

		// modify request with generated `login` parameter
		RequestWrapper modifiedRequest = new RequestWrapper(request);
		modifiedRequest.setParameter(UserConstants.KEY_LOGIN, nextUserId(userAdmin));

		// continue with filter chain
		chain.doFilter(modifiedRequest, response);

		// reset `login` to be the same as the UID
		User user = userAdmin.getUser(UserConstants.KEY_EMAIL, email);
		if (user != null) {
			boolean doUpdate = false;
			String uid = user.getUid();
			String value = user.getLogin();
			if (value.startsWith(ID_TEMPLATE)) {
				user.setLogin(uid);
				doUpdate = true;
			}
			// if 'name' parameter isn't specified, gets set to 'login' by Orion
			value = user.getName();
			if (value.startsWith(ID_TEMPLATE)) {
				user.setName(uid);
				doUpdate = true;
			}
			// update
			if (doUpdate) {
				userAdmin.updateUser(user.getUid(), user);  // errors logged by Orion
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

		// modify request with generated `login` parameter
		RequestWrapper modifiedRequest = new RequestWrapper(request);
		modifiedRequest.setParameter(UserConstants.KEY_LOGIN, user.getLogin());

		// continue with filter chain
		chain.doFilter(modifiedRequest, response);
		return true;
	}

	private IOrionCredentialsService getUserAdmin() {
		return UserServiceHelper.getDefault().getUserStore();
	}

	private String nextUserId(IOrionCredentialsService userAdmin) {
		synchronized (userCounter) {
			String candidate;
			do {
				candidate = ID_TEMPLATE + userCounter.toString();
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
		if (name.equals(email) || name.length() == 0) {
			// By default, "name" was set to "login" (which was really an email).  Now set to same
			// as new "login", to match Orion 1.0+ behavior.  The `if` statement checks that "name"
			// still contains the default value; if it was changed by user, do not overwrite.
			user.setName(user.getLogin());
		}

		// update
		IStatus status = userAdmin.updateUser(uid, user);  // errors logged by Orion
		if (!status.isOK()) {
			return null;
		}

		return user;
	}
}

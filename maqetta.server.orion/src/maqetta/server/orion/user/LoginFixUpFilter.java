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

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.orion.server.core.resources.Base64Counter;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.User;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.eclipse.orion.server.useradmin.UserServiceHelper;

//POST /users/ creates a new user
//
// Intercepts call to create a new user and updates the request parameters for use by Orion.
//
// The Orion code expects the following parameters when creating a user:
//        login: a unique, alphanumeric username
//        password:
//        email: (optional) unique email
//        name: (optional) display name
//
// For Maqetta, we don't want to use 2 different unique identifiers ("login" and "email"). Plus,
// we have existing users whose "login" is an email and have no value for "email".  Maqetta requests
// will come with the following parameters (as of M10):
//        login: empty string or non-existent
//        password:
//        email: unique email
//        name: (optional) display name
//
// Here, we intercept the request and set the `login` to a generated value.

@SuppressWarnings("restriction")
public class LoginFixUpFilter implements Filter {

	private static final Base64Counter userCounter = new Base64Counter();
	private static final String ID_TEMPLATE = "00MaqTempId00";

	public void init(FilterConfig filterConfig) throws ServletException {
	}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;

		// POST calls to /users
		if ("POST".equals(httpRequest.getMethod()) && httpRequest.getPathInfo() == null) { //$NON-NLS-1$
			String login = request.getParameter(UserConstants.KEY_LOGIN);
			String email = request.getParameter(UserConstants.KEY_EMAIL);
			if (login == null || login.length() == 0) {
				IOrionCredentialsService userAdmin = getUserAdmin();
				
				// modify request with generated `login` parameter
				RequestWrapper modifiedRequest = new RequestWrapper(httpRequest);
				modifiedRequest.setParameter(UserConstants.KEY_LOGIN, nextUserId(userAdmin));
				
				// continue with filter chain
				chain.doFilter(modifiedRequest, response);
				
				// reset `login` to be the same as the UID
				User user = userAdmin.getUser(UserConstants.KEY_EMAIL, email);
				if (user != null) {
					String uid = user.getUid();
					String value = user.getLogin();
					if (value.startsWith(ID_TEMPLATE)) {
						user.setLogin(uid);
					}
					// if 'name' parameter isn't specified, gets set to 'login' by Orion
					value = user.getName();
					if (value.startsWith(ID_TEMPLATE)) {
						user.setName(uid);
					}
					// update
					IStatus status = userAdmin.updateUser(user.getUid(), user);
/*XXX*/				System.err.println(status);
				}
				
				return;
			}
		}

		chain.doFilter(request, response);
	}

	public void destroy() {
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
}

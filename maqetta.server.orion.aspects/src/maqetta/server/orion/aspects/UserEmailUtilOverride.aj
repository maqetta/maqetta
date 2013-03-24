package maqetta.server.orion.aspects;

import maqetta.server.orion.aspects.internal.Activator;

import org.eclipse.orion.server.useradmin.UserAdminActivator;
import org.eclipse.orion.server.useradmin.UserEmailUtil;
import org.osgi.framework.BundleContext;

@SuppressWarnings("restriction")
privileged aspect UserEmailUtilOverride {

	/**
	 * Override the email templates which are loaded by the Orion.
	 * When creating a new EmailContent object (from UserEmailUtil.java), use our bundle context
	 * instead of theirs to load the email templates.
	 */
	pointcut userAdminBundle() :
		call(* UserAdminActivator.getBundleContext()) &&
		within(UserEmailUtil.EmailContent);

	BundleContext around(): userAdminBundle() {
		return Activator.getDefault().getBundleContext();
	}

}

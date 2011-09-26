package maqetta.core.server.standalone;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NameNotFoundException;
import javax.naming.NamingException;

import org.maqetta.server.IMaqettaConfig;
import org.maqetta.server.ServerManager;

public class MaqettaConfig implements IMaqettaConfig {

	public MaqettaConfig() {
		// TODO Auto-generated constructor stub
	}

	public String getProperty(String propertyName) {
		 String property = null;
	        if (ServerManager.IN_WAR) {
	            try {
	                Context env = (Context) new InitialContext().lookup("java:comp/env");
	                property = (String) env.lookup(propertyName);
	            } catch (NameNotFoundException e) {
	                // ignore
	            } catch (NamingException e) {
	                e.printStackTrace();
	            }

	            // String property
	            // =this.servletConfig.getServletContext().getInitParameter(propertyName);
	            System.out.println("servlet parm '" + propertyName + "' is : " + property);

	        }
	        if (property == null) {
	            property = System.getProperty(propertyName);
	            System.out.println("servlet parm '" + propertyName + "' is : " + property);
	        }
	        return property;
	}

	public void setProperty(String propname, String value) {
		// TODO Auto-generated method stub

	}

}

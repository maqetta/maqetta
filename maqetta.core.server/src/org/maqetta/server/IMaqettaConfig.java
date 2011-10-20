package org.maqetta.server;

public interface IMaqettaConfig {

	public String getProperty(String propname);
	
	public void setProperty(String propname, String value);
	
}

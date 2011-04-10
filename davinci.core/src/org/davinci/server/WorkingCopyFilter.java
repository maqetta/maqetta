package org.davinci.server;

public class WorkingCopyFilter implements IVResourceFilter {

	public boolean isHidden(IVResource file) {
		if(file.getPath().indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) > -1       )
			return true;
	
		return false;
	}

}

package org.davinci.server;

import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class DirectoryFilter implements IVResourceFilter {

    private String[] filterDirs;

    public DirectoryFilter(String directoryName) {
        this.filterDirs = new String[] { directoryName };
    }

    public DirectoryFilter(String[] directoryNames) {
        this.filterDirs = directoryNames;
    }

    public boolean isHidden(IVResource file) {
        IPath path = new Path(file.getPath());
        for (int i = 0; i < this.filterDirs.length; i++) {
            for(int k=0;k<path.segmentCount();k++){
            	String seg = path.segment(k);
            	if(seg!=null && seg.equalsIgnoreCase(filterDirs[i])) return true;
            }
            
            
        }
        return false;
    }

}

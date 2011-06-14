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
            IPath fp = new Path(filterDirs[i]);
            if (fp.isPrefixOf(path)) {
                return true;
            }
        }
        return false;
    }

}

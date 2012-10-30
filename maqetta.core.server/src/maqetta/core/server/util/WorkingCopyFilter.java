package maqetta.core.server.util;

import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IVResource;
import org.maqetta.server.IVResourceFilter;

public class WorkingCopyFilter implements IVResourceFilter {

    public boolean isHidden(IVResource file) {
        if (file.getPath().indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) > -1) {
            return true;
        }

        return false;
    }

}

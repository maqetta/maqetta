dojo.provide("davinci.review.Runtime");
dojo.require("davinci.review.actions.PublishAction");
dojo.require("davinci.review.Color");

dojo.mixin(davinci.review.Runtime,{
    getRole: function(){
        if(!davinci.Runtime.commenting_designerName)
            return "Designer";
        else{
            if(!davinci.Runtime.userInfo){
                var result = davinci.Runtime.serverJSONRequest({
                    url: "davinci/cmd/getReviewUserInfo",
                    sync: true
                });
                davinci.Runtime.userInfo = result;
            }
            if(davinci.Runtime.userInfo.userName==davinci.Runtime.commenting_designerName)
                return "Designer";
        }
        return "Reviewer";
    },
    
    getDesigner: function() {
        if(davinci.Runtime.commenting_designerName)
            return davinci.Runtime.commenting_designerName;
        else{
                if(!davinci.Runtime.userInfo){
                    var result = davinci.Runtime.serverJSONRequest({
                        url: "davinci/cmd/getReviewUserInfo",
                        sync: true
                    });
                    davinci.Runtime.userInfo = result;
                }
                return davinci.Runtime.userInfo.userName;
            }
    },
    
    getDesignerEmail: function() {
        if(davinci.Runtime.commenting_designerEmail)
            return davinci.Runtime.commenting_designerEmail;
        else{
                if(!davinci.Runtime.userInfo){
                    var result = davinci.Runtime.serverJSONRequest({
                        url: "davinci/cmd/getReviewUserInfo",
                        sync: true
                    });
                    davinci.Runtime.userInfo = result;
                }
                return davinci.Runtime.userInfo.email;
            }
    },
    
    publish: function(node) {
        var publish = new davinci.review.actions.PublishAction();
        publish.run(node);
    },
    
    //two modes in design page and in review page
    getMode: function() {
        if(davinci.Runtime.commenting_designerName)
            return "reviewPage";
        else return "designPage";
    },
    
    
    getColor: function(/*string*/ name) {
        var index;
        dojo.some(this.reviewers,function(item,n){
            if(item.name==name){
                index = n;
                return true;
            }
            return false;
        });
        return davinci.review.colors.colors[index];
    },
    
    logoff: function(args) {
        davinci.Runtime.unload();
        davinci.Runtime.serverJSONRequest({
               url:"davinci/cmd/logoff", handleAs:"text",
                   sync:true  });
        var newLocation = davinci.Workbench.location(); //
        
        location.href = newLocation+"/"+davinci.Runtime.commenting_designerName;
    }    
});
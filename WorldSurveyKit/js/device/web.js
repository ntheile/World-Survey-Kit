// Web Specific Code

//console.log('web');
$.mobile.defaultPageTransition = 'none';
App.delay = 800;

require(['cordova'], function (cordova) {

    $("#state").html('<div style="color:green">State: online</div>');

    //************************//
    //                        //
    //                        //
    //                        //
    //       FB  Auth         //     
    //                        //     
    //                        //
    //                        //
    //************************//
    
    require(['//connect.facebook.net/en_US/all.js'], function () {
        
        require(["libs/backbone.facebook"], function (BBFB) {

                FB.init({
                    appId: App.fbid,
                    status: true,
                    cookie: true,
                    xfbml: true,
                    frictionlessRequests: true,
                    useCachedDialogs: true,
                    oauth: true
                });

                           
                require(["views/AuthView"], function (AuthView) {

                    App.authView = new AuthView(); // view
                    App.authView.start();

                });
  
        });

    });
   
    
});
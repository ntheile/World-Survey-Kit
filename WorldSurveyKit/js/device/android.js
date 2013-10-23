// Android Specific Code

console.log("android");
$.mobile.defaultPageTransition = 'none';
$.mobile.allowCrossDomainPages = true;
$.mobile.buttonMarkup.hoverDelay = 0;

App.delay = 1000;

require(['cordovaAndroid'], function (cordovaAndroid) {
    

    App.onDeviceReady = function () {

        // Are we online?
        App.networkState = navigator.connection.type;

        console.log('=====> Connection.' + App.networkState);

        // FB Auth 
        require(['libs/cdv-plugin-fb-connect'], function (CDVFB) {
            require(["libs/facebook_js_sdk"], function (FBSDK) {

               
                    FB.init({
                        appId: App.fbid,
                        nativeInterface: CDV.FB, //use native login dialog, but it's modified to support multiple users per device
                        useCachedDialogs: false
                    });


                    require(["libs/backbone.facebook", "views/AuthView"], function (BBFB, AuthView) {

                        App.authView = new AuthView(); // view
                        App.authView.start();

                    });
   
            });

        });
        
        App.onOffline = function () {

            // Handle the offline event
            App.networkState = navigator.connection.type;
            console.log('=====> Connection.' + App.networkState);

        };
        document.addEventListener("offline", App.onOffline, false);

       
        App.onOnline = function () {

            App.networkState = navigator.connection.type;
            console.log('=====> Connection.' + App.networkState);

        };
        document.addEventListener("online", App.onOnline, false);

    };

    // bind to the device being ready
    document.addEventListener("deviceready", App.onDeviceReady, false);

});




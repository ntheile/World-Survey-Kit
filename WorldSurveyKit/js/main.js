//************************//
//                        //
//                        //
//                        //
//     Main App start     //     
//                        //     
//                        //
//                        //
//************************//

// global namespaces
var App = App || {};

// js cache buster
if (document.domain == "localhost") {
    // for dev we clear the cache everytime
    App.version = (new Date()).getTime(); 
}
else {
    // increment this after every major release is pushed to clear the users browser cache
    App.version = 223;
}

App.loginPageHash = "#login";



"use strict";

// IE console.log fixer
(function (con) {
    'use strict';
    var prop, method;
    var empty = {};
    var dummy = function () { };
    var properties = 'memory'.split(',');
    var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
       'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
       'time,timeEnd,trace,warn').split(',');
    while (prop = properties.pop()) con[prop] = con[prop] || empty;
    while (method = methods.pop()) con[method] = con[method] || dummy;
})(window.console = window.console || {});

console.log('in main.js');


//************************//
//                        //
//                        //
//                        //
//     Require AMD        //     
//                        //     
//                        //
//                        //
//************************//

// Sets the require.js configuration for your application.

console.log('b4 req config');
require.config({
    urlArgs: "v=" + App.version,
    catchError: false,
    waitSeconds: 600,
    paths: {
        // Core Libraries and js files
        "jquery": "libs/jquery-1.8.2.min",
        "jquerymobile": "libs/jquerymobile-1.3.0",
        "underscore": "libs/lodash",
        "modernizr": "libs/modernizr",
        "text": "libs/text",
        "backbone": "libs/backbone-0.9.2",
        "backboneOffline": 'libs/backbone.offline',
        "cordovaAndroid": 'libs/cordova-android-2.5.0',
        "cordova": 'libs/cordova-android-2.3.0', 
        "sig": "libs/jquery.signaturepad",
        "backstretch": "libs/jquery.backstretch.min",
        "dataTables": "libs/jquery.dataTables",
        "sly": "libs/sly",
        "modernizrCustom": "libs/shims/extras/modernizr-custom",
        "polyfiller": "libs/shims/polyfiller",
        "android": "device/android",
        "web": "device/web",
        "config": "config",
        "handsontable": "libs/jquery.handsontable.full",
        "q": "libs/q",
        "tourbus": "libs/jquery.tourbus",
        "tdfriendselector": "libs/tdfriendselector",
        "fastclick": "libs/fastclick"
    },
    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {

        "backbone": {
            "deps": ["underscore", "jquery", "text"],
            "exports": "Backbone" 
        },
        "backstretch": {
            "deps": ["jquery"],
            "exports": "Backstretch"
        },
        "sly": {
            "deps": ["jquery"],
            "exports": "sly"
        },
        "polyfiller": {
            "deps": ["jquery", "modernizrCustom"],
            "exports": "Polyfiller"
        },
        "tourbus": {
            "deps": ["jquery"],
            "exports": "tourbus"
        }

    } // end Shim Configuration

});

// Include File Dependencies
require(["jquery", "backbone", "backstretch", "dataTables", "sly", "modernizrCustom", "q", "tourbus" , "fastclick"], function ($, Backbone, backstretch, dataTables, sly, modernize, q, tourbus, fastclick) {

    jQuery.noConflict;
    
    // remove the 300 ms delay with Fastclick
    FastClick.attach(document.body);

    // load and implement all unsupported features if the canvas does not exist (Mainly used for IE 8 support)
    if (!Modernizr.canvas) {
        require(["polyfiller"], function (poly) {
            $.webshims.polyfill();
        });
    }

    
    // utilities namespace
    App.utils = App.utils || {};

    // helper
    $.wait = function (time) {
        return $.Deferred(function (dfd) {
            setTimeout(dfd.resolve, time);
        });
    };

    // helper to string all html out of a string
    App.utils.strip = function (str) {
        str = $("<div>" + str + "</div>").text();
        return str;
    };


    // set up sly slider
    $('#frame').sly({
        horizontal: 1,
        itemNav: 'centered',
        itemSelector: 'div',
        // Scrollbar
        scrollBar: '.scrollbar',
        dragHandle: 1,
        dragging: 1,
        activateMiddle: 0,
        // dragging
        dragSource: "#frame",
        mouseDragging: 1,    // Enable navigation by dragging the SLIDEE with mouse cursor.
        touchDragging: 1,    // Enable navigation by dragging the SLIDEE with touch events.
        releaseSwing: 1,    // Ease out on dragging swing release.
        swingSpeed: 0.2,  // Swing synchronization speed, where: 1 = instant, 0 = infinite.
        elasticBounds: 1,    // Stretch SLIDEE position limits when dragging past FRAME boundaries.
        pagesBar: '.pages',
        activatePageOn: 'click', // Event used to activate page. Can be: click, mouseenter, ...
        pageBuilder:          // Page item generator.
            function (index) {
                return '<li>' + (index + 1) + '</li>';
            },
        // Automated cycling
        startAt: 0,
        scrollBy: 0,
        cycleBy: 'pages',
        cycleInterval: 4000,
        pauseOnHover: 1,
        startPaused: 0,
        speed: 300
    });

    // set up sly slider
    $('#frame2').sly({
        horizontal: 1,
        itemNav: 'centered',
        itemSelector: 'div',
        // Scrollbar
        scrollBar: '.scrollbar2',
        dragHandle: 1,
        dragging: 1,
        activateMiddle: 0,
        // dragging
        dragSource: "#frame2",
        mouseDragging: 1,    // Enable navigation by dragging the SLIDEE with mouse cursor.
        touchDragging: 1,    // Enable navigation by dragging the SLIDEE with touch events.
        releaseSwing: 1,    // Ease out on dragging swing release.
        swingSpeed: 0.2,  // Swing synchronization speed, where: 1 = instant, 0 = infinite.
        elasticBounds: 1,    // Stretch SLIDEE position limits when dragging past FRAME boundaries.
        pagesBar: '.pages2',
        activatePageOn: 'click', // Event used to activate page. Can be: click, mouseenter, ...
        pageBuilder:          // Page item generator.
            function (index) {
                return '<li>' + (index + 1) + '</li>';
            },
        // Automated cycling
        startAt: 0,
        scrollBy: 0,
        cycleBy: 'pages',
        cycleInterval: 4000,
        pauseOnHover: 1,
        startPaused: 0,
        speed: 300
    });




    // app start code
    // get the config then start the app
    require(['config'], function (config) {
        console.log('in go()');

        // load up config file values
        App.backStretch = $.backstretch(App.bgImage); // Background image on login page
        document.getElementById("daContacter").innerHTML = "<a href='" + "mail" + "to:" + App.emailToName + "@" + App.emailProvider + "'>" + App.emailToName + "@" + App.emailProvider + "</a>"; // contact
        $("#appLogo").attr("src", App.logo);
        $("#appOrgName").html(App.organizationsName);

        // config
        $.support.cors = true;
        var global = this;
        global._ = global._ || _;
        global.Backbone = global.Backbone || Backbone;

        console.log('b4 mobile init');

        // Set up the "mobileinit" handler before requiring jQuery Mobile's module
        // This code runs once jQuery Mobile is ready
        $(document).on("mobileinit",
		    
		    function () {

		        // JQM / Backbone Config
		        // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
		        $.mobile.linkBindingEnabled = false;
		        // Disabling this will prevent jQuery Mobile from handling hash changes
		        $.mobile.hashListeningEnabled = false;
                // prevents an ajax post on forms
		        //$.mobile.ajaxFormsEnabled = false;

                ///
		        /// Load Platform Specific Modules
		        /// 

		        //************************//
		        //         Android        //
		        //                        //
		        //          i_i           //
		        //         [@_@]          //     
		        //        /|___]\         //     
		        //         d   b          //
		        //                        //
		        //************************//
		        if (App.platform === "Android") {
		            console.log('App plat is android');
		            require(['device/android'], function () {

		            });

		        }
		        //************************//
		        //         iPhone         //
		        //                        //
		        //            .:'         //
                //          __ :'__       //
                //       .'`__`-'__``.    //
                //      :__________.-'    //
                //      :_________:       //
                //       :_________`-;    // 
		        //        `.__.-.__.'     //
                //                        //
		        //************************//
		        else if (App.platform === "iPhone") {
		            console.log('App plat is iPhone');
		            require(['device/iphone'], function () {

		            });
		        }
		        //************************//
		        //         Web            //
		        //                        //
		        //    ______________      //
		        //    ||           ||     //     
		        //    ||           ||     //     
		        //    ||___________||     //
		        //                        //
		        //************************//
		        else {
		            require(['device/web'], function () {

		            });
		        }
		    }
	    );
        require(["jquerymobile", "backboneOffline"], function (JqueryMobile, BackboneOffline) {

        });

    });

});


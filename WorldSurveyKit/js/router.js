//  Router - this is where #hash based routing occurs
// =======================================================

// Includes file dependencies
define(["jquery", "backbone", "text!templates/MenuTemplate.html", "collections/MenuCollection", "models/MenuModel", "views/MenuView",
        "models/Models", "views/OrgCompositeView",
        "collections/OrgCollection", "views/CollView", "views/UserCompositeView", "collections/UserOrgCollection",
        "text!templates/AdminMenuTemplate.html", "views/FileBuilderCompositeView", "collections/FileCollection",
        "collections/QuestionCollection", "views/FileCompositeView", "views/QOpenEndedView", "views/QOptionAnswerView",
        "views/QGpsView", "views/QCameraView", "views/QSignatureView", "views/HomeCompositeView", "views/SettingsCompositeView",
        "collections/UFileCollection", "collections/UQuestionCollection", "collections/UOptionCollection", "collections/UResponseCollection", "collections/UFileInstanceCollection",
        "views/UserManagerView", "views/GoCompositeView", "text!templates/NavBarAdminTemplate.html", "text!templates/NavBarUserTemplate.html",
        "views/ReportTableView", "collections/ResponseCollection", "collections/FileInstanceCollection", "views/ImportView", "views/HistoryView"],
      function ($, Backbone, MenuTemplate, MenuCollection, MenuModel, MenuView,
                Models, OrgCompositeView,
                OrgCollection, CollView, UserCompositeView, UserOrgCollection,
                AdminMenuTemplate, FileBuilderCompositeView, FileCollection,
                QuestionCollection, FileCompositeView, QOpenEndedView, QOptionAnswerView,
                QGpsView, QCameraView, QSignatureView, HomeCompositeView, SettingsCompositeView,
                UFileCollection, UQuestionCollection, UOptionCollection, UResponseCollection, UFileInstanceCollection,
                UserManagerView, GoCompositeView, NavBarAdminTemplate, NavBarUserTemplate,
                ReportTableView, ResponseCollection, FileInstanceCollection, ImportView, HistoryView) {

    var NavBarTemplate;

    // Get the Admin vs. User Routes     
    // Admin Routes
    if (App.isAdmin) {
        App.routes = {
            "": "home",

            "home": "home",

            "login": "login",

            "admin": "admin",

            "profile?:orgId": "profile",

            "build?:orgId": "build",

            "file?:fileId": "file",

            "question?:questionId": "question",

            "coll": "coll",

            "test": "test",

            "settings": "settings",

            "go?file=:fileInstanceId?q=:questionId": "go",

            "go?file=:fileInstanceId": "go",

            "go?file:fileInstanceId?q:questionId?ed:edit": "go", 

            "go?file:fileInstanceId?q:questionId": "go", 

            "go?file:fileInstanceId": "go", 

            "error": "error",

            "history?:page": "history",

            "reports": "reports",

            "reports?:fileId": "reportsTable",

            "importer?:id": "importer",

            "tutorial": "tutorial"

        };

        NavBarTemplate = NavBarAdminTemplate;

    }
    // User Routes
    else {

        App.routes = {
            "": "home",

            "home": "home",

            "login": "login",

            "profile?:orgId": "profile",

            "coll": "coll",

            "settings": "settings",

            "go?file=:fileInstanceId?q=:questionId": "go",

            "go?file=:fileInstanceId": "go",

            "go?file:fileInstanceId?q:questionId": "go", 

            "go?file:fileInstanceId": "go", 

            "error": "error",

            "history?:page": "history",

            "reports?:fileId": "reportsTable",

            "tutorial": "tutorial"

        };

        NavBarTemplate = NavBarUserTemplate;
        $(".admin-only").hide();
    }

  
    // Backbone.Router
    var Router = Backbone.Router.extend( {

        // The Router constructor
        initialize: function () {

            console.log('router init');

            $.mobile.loading("show", {
                text: "Loading, Please Wait...",
                textVisible: true,
                theme: "a"

            });

            $("#home-load").show();
            
            // deferred object until app is loaded
            App.loaded = App.loaded || {};
            App.loaded.deferred = new $.Deferred();
            App.loaded.deferred.promise();

            ///
            /// 1. get all the data collections for the user app
            ///    a deferred object is returned
            ///

                App.uFileCollection = new UFileCollection();

                // get your questions
                App.uQuestionCollection = new UQuestionCollection();

                // get your files instances
                App.uFileInstanceCollection = new UFileInstanceCollection();

                // get the options for the questions
                App.uOptionCollection = new UOptionCollection();

                // get the responses from stuff you already answered
                App.uResponseCollection = new UResponseCollection();

                if (App.isAdmin) {
   
                    App.fileCollection = new FileCollection();
                }
                
                // if its first load we want to get the App.fileInstanceCollection to judge load time of data
                if (!localStorage.loaded) {
                    console.log("first load - get App.fileInstanceCollection");
                    App.fileInstanceCollection = new FileInstanceCollection();
                }


                // re-fetch file data from the server - file, question and options
                App.fetchFileData = function () {

                    // admin file data
                    $.mobile.loading("show");
                    App.fileCollection.fetch();
                    App.questionCollection.fetch({
                        success: function () {
                            // triggger re-style
                            $.mobile.loading("hide");
                            $("#file").trigger("create");
                        }
                    });
                    
                    // user file data
                    App.uFileCollection.storage.sync.incremental({url: App.utils.urlify("Files/" + App.defaultOrg) });
                    App.uQuestionCollection.storage.sync.incremental({ url: App.utils.urlify("UQuestionCollection/" + App.defaultOrg) });
                    App.uOptionCollection.storage.sync.incremental({ url: App.utils.urlify("OptionCollection/" + App.defaultOrg) });

                };
                
 
                // re-fetch the local files
                App.localFileLoad = function () {

                    $.when(
                        App.uQuestionCollection.deferred,
                        App.uFileInstanceCollection.deferred,
                        App.uFileCollection.deferred,
                        App.uResponseCollection.deferred,
                        App.uOptionCollection.deferred
                    ).then(function () {
                        App.uFileCollection.fetch({ local: true });
                        App.uQuestionCollection.fetch({ local: true });
                        App.uFileInstanceCollection.fetch({ local: true });
                        App.uResponseCollection.fetch({ local: true });
                        App.uOptionCollection.fetch({ local: true });
                    });

                };

 
            ///
            /// App.syncSurvey can be called anywhere in the app when you want to sync dirty surveys with the server
            /// 1). First it  syncs the dirty FileInstanceModel with the server
            /// 2.) Second a sid is returned for each dirty file instance, we use this sid to update the newFileInstanceId in the uResponse model
            /// 3). We sync the App.uResponseCollection with the server
            ///  Uses storage.sync.pushFull
            ///
                App.syncSurvey = function (thisFileInstanceId) {

                    console.log("App.syncSurvey() called");
                    console.log(thisFileInstanceId);

                    // get the uFileInstance by the client Id or sid passed in
                    var thisDirtyFileInstance;

                    if (App.isClientId(thisFileInstanceId)) {
                        thisDirtyFileInstance = App.uFileInstanceCollection.storage.collection.where({ dirty: true, id: thisFileInstanceId });
                    }
                    else {
                        thisDirtyFileInstance = App.uFileInstanceCollection.storage.collection.where({ dirty: true, sid: parseInt(thisFileInstanceId) });
                    }

                    console.log(thisDirtyFileInstance[0]);

                    // dirty file instance
                    if (thisDirtyFileInstance.length > 0) {

                        // push the FileInstance to the server, then the fk will auto swap the value
                        // of the newFileInstanceId field of the responseCollection
                        // from the client ID to the newly created server id

                        console.log("Yep, file instance is dirty");
                        var thisFileInstanceSid = App.uFileInstanceCollection.storage.sync.pushItemFull(thisDirtyFileInstance[0], function (data) {
                            // loop through all the responses in the file instance and sync
                            
                            console.log("thisFileInstanceSid");
                            console.log(thisFileInstanceSid);
                            console.log("Data");
                            console.log(data);

                            
                            if ( data.hasOwnProperty("success") ) {
                                console.log("super success, now sync the responses");
                                // push each response in collection
                                _.each(App.uResponseCollection.where({ newFileInstanceId: thisFileInstanceSid }), function (model) {
                                    App.uResponseCollection.storage.sync.pushItemFull(model);
                                });
                                
                            }

                            // now update the sync count in the settings view
                            $("#settingsSyncAll").click();
                           
                            
                        });
                        
                    }
                    // no dirty file instances, so just push responses
                    else {
                        console.log("No dirty files just check newFileInstanceId and push responses");
                        // must grab this fileInstances client id 
                        try{
                            var cid = App.uFileInstanceCollection.where({ sid: parseInt(thisFileInstanceId) })[0].get("id");
                            _.each(App.uResponseCollection.where({ newFileInstanceId: cid }), function (model) {
                                App.uResponseCollection.storage.sync.pushItemFull(model);
                            });

                            // now update the sync count in the settings view
                            $("#settingsSyncAll").click();
                        }
                        catch (e) { }
                       
                    }
                  
                };

                
                // check if model has dirty attr set to true
                App.isDirty = function (model) {

                    var isDirty = model.get("dirty");

                    if (isDirty == true) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };


                App.isClientId = function (str) {
                    if (str.indexOf("-") >= 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };


            ///
            /// After all files are loaded code goes here
            ///
                // when the files are loaded hide the spinner and set up sync Interval (note that alot of the files are locally cached)
                $.when(
                   App.uQuestionCollection.deferred,
                   App.uFileInstanceCollection.deferred,
                   App.uFileCollection.deferred,
                   App.uResponseCollection.deferred,
                   App.uOptionCollection.deferred
                ).then(function () {

                    // check if first load exists
                    if (localStorage.loaded) {
                        console.log("already load");
                        App.loaded.deferred.resolve();
                        $.mobile.loading("hide");
                    }
                    else {
                        console.log("first load ever");
                        // wait for data to load since it has never been cached
                        $("#home-load-msg").html("Please wait, loading user settings for the first time...");
                        $.when(
                            App.fileInstanceCollection.deferred
                        ).then(function () {
                            $.wait(2000).then(function () {
                                // fetch local data
                                localStorage.loaded = true;
                                App.localFileLoad();
                                $.mobile.loading("hide");
                                $("#home-load-msg").hide();
                                App.loaded.deferred.resolve();
                                var tour = $('#my-tour-id').tourbus({});
                                tour.trigger('depart.tourbus');
                            });
                        });
                    }
                }, function () {
                    //error
                    $.mobile.loading("hide");
                    console.log("Error fetching files on init");

                    App.loaded.deferred.reject("files failed to load");

                    // TODO maybe present a refresh button if files fail to load
                });


                // Tell Backbone to start watching for hashchange events
                Backbone.history.start();


        },

        // Backbone.js Routes
        routes: App.routes,

        /// <summary>
        /// The login page for the mobile app
        /// </summary>
        login: function () {

            // Programatically changes to the categories page using jquery mobile and backbone routing
            $.mobile.changePage("#login", { reverse: false, changeHash: false });

        },

        /// <summary>
        /// The error page for the mobile app
        /// </summary>
        error: function () {

            // Programatically changes to the categories page
            $.mobile.changePage("#error", { reverse: false, changeHash: false });

        },

        /// <summary>
        /// The home page for the mobile app
        /// </summary>
        home: function () {

            console.log("====> home page");

         
            $.mobile.loading("show");

            // wait for the FileCollection to Load First
            $.when(
                App.uFileInstanceCollection.deferred,
                App.uQuestionCollection.deferred,
                App.uFileCollection.deferred,
                App.uResponseCollection.deferred,
                App.uOptionCollection.deferred,
                App.loaded.deferred
            ).then(function () {

                ///
                /// success - Main code goes here
                /// 
                console.log("All files fetched");

                // show dom ele
                $.mobile.changePage("#home", { reverse: false, changeHash: false });

                $("[data-role='wsk-nav-bar']").html(_.template(NavBarTemplate, { orgId: App.defaultOrg, homeSelected: "ui-btn-active" }));
                $("#home").trigger("create");


                // show dom ele

                if (!App.homeCompositeView) {
                    App.homeCompositeView = new HomeCompositeView();
                    App.homeCompositeView.render();
                }
                else {
                    App.homeCompositeView.render();
                }

                // style
                $("#home").trigger("create");


                ///
                /// End Success
                ///

            }, function () {
                //error
                console.log("Error fetching files");
            });


        },

        /// <summary>
        /// The history page
        /// </summary>
        history: function (page) {

            console.log("====> history page");

            $.mobile.loading("show");
            $.mobile.changePage("#history", { reverse: false, changeHash: false });

            // style
            $("#history").trigger("create");

            var self = this;

            // make sure all the files are loaded
            // assume the collections all exist in all sub views
            $.when(
                App.uQuestionCollection.deferred,
                App.uFileInstanceCollection.deferred,
                App.uFileCollection.deferred,
                App.uResponseCollection.deferred,
                App.uOptionCollection.deferred
            ).then(function () {

                ///
                /// success - Main code goes here
                /// 
                    console.log("All files fetched");

                    $.mobile.loading("hide");

                    if (!App.historyView) {
                        App.historyView = new HistoryView();
                    }
                    App.historyView.render(parseInt(page, 10));
                    
                    

                ///
                /// End Success
                ///

            }, function () {
                //error
                console.log("Error fetching files");
            });

        },

        /// <summary>
        /// The reports page 
        /// </summary>
        reports: function () {

            console.log("====> reports page");

            // show dom ele
            $.mobile.changePage("#reports", { reverse: false, changeHash: false });

            $("[data-role='wsk-nav-bar']").html(_.template(NavBarTemplate, { orgId: App.defaultOrg, reportsSelected: "ui-btn-active" }));

            // show all surveys 
            $("#reportsTable").html("");
            $("#reportsMain").html("<h3>Choose a survey to report on:</h3><p>View tables and lists. Print reports, export data to excel (CSV). Import data in bulk.</p>");

            $("#reportsMain").append("<ul data-role='listview' data-inset='true' class='reportsMainList'></ul>");
            $("#reports").trigger("create");

            $.when(
                  App.uFileCollection.deferred
            ).then(function () {
                _.each(App.uFileCollection.models, function (model) {
                    $(".reportsMainList").append("<li><a href='#reports?" + model.get("sid") + "' >" + model.get("fileName") + "</a></li>");
                    $(".reportsMainList").listview("refresh");
                });
            });

        },

        /// <summary>
        /// Displays the table reports for file 
        /// </summary>
        reportsTable: function (fileId) {

            console.log("====> reports table page");

            // show dom ele
            $.mobile.changePage("#reports", { reverse: false, changeHash: false });

            $("[data-role='wsk-nav-bar']").html(_.template(NavBarTemplate, { orgId: App.defaultOrg, reportsSelected: "ui-btn-active" }));
            $("#reports").trigger("create");

            $("#reportsMain").html("");

            $("#reportsTable").html("");
            $.mobile.loading("show", {
                text: "Loading Report. This may take some time...",
                textVisible: true,
                theme: "a"
            });

            if (!App.responseCollection) {
                App.responseCollection = new ResponseCollection();   // TODO change this to get all responses by fileId, add an attribute "cachedForFile" to collection containing files that have already been fetched
            }

            if (!App.fileInstanceCollection) {
                App.fileInstanceCollection = new FileInstanceCollection();  // TODO change this to get all fileInstances by fileId,  add an attribute "cachedForFile" to collection containing files that have already been fetched
            }

            try{
                //if (App.importer.reloadFlag) { // this route might be slow if there is a large number of surveys
                //    App.importer.reloadFlag = false;
                    $("#report-sync").html("syncing...");
                    App.fileInstanceCollection.fetch({
                        reset: true,
                        success: function () {
                            $("#report-sync").html("");
                            App.reportTableView.render(fileId);
                        }
                    });
                //}
            }
            catch (e) { }
            
            

            $.when(
                 App.uQuestionCollection.deferred,
                 App.uFileInstanceCollection.deferred,
                 App.uFileCollection.deferred,
                 App.uResponseCollection.deferred,
                 App.responseCollection.deferred,
                 App.fileInstanceCollection.deferred,
                 App.uOptionCollection.deferred
           ).then(function () {
               $.mobile.loading("hide");
               if (!App.reportTableView) {
                   App.reportTableView = new ReportTableView();
                   App.reportTableView.render(fileId);
               }
               else {
                   App.reportTableView.render(fileId);
               }

           });
           
        },

        /// <summary>
        /// The settings page for the mobile app
        /// </summary>
        settings: function () {

            console.log("====> settings page");

            // show dom ele
            $.mobile.changePage("#settings", { reverse: false, changeHash: false });

            $("[data-role='wsk-nav-bar']").html(_.template(NavBarTemplate, { orgId: App.defaultOrg, settingsSelected: "ui-btn-active" }));
            $("#settings").trigger("create");

            if (!App.settingsCompositeView) {
                App.settingsCompositeView = new SettingsCompositeView();
                App.settingsCompositeView.render();
            }
            else {
                App.settingsCompositeView.render();
            }


            // create view if it hasn't aleaready been created
            if (App.orgCompositeView) {

            }
            else {

                // collection
                App.orgCollection = new OrgCollection();

                // Org View 
                App.orgCompositeView = new OrgCompositeView();

            }

            // style
            $("#settings").trigger("create");

        },

        /// <summary>
        /// Go View for answering a question from a survey
        /// </summary>
        go: function (fileInstanceId, questionId, edit) {

            // show dom ele
            $.mobile.changePage("#go", { reverse: false, changeHash: false });

            //$.mobile.loading("show");

            var self = this;

            // admin edit view (if router has edit on the end of it)
            if (edit == "it") {
                // fetch the fileInstance and Respsonses from the server if they have not been fetched yet
                if (!App.fileInstanceCollection) {
                    App.fileInstanceCollection = new FileInstanceCollection();
                    App.fileInstanceCollection.fetch();
                }
                if (!App.responseCollection) {
                    App.responseCollection = new ResponseCollection();
                    App.responseCollection.fetch();
                }

                // make sure all the files are loaded
                // assume the collections all exist in all sub views
                $.when(
                    App.uQuestionCollection.deferred,
                    App.uFileCollection.deferred,
                    App.uOptionCollection.deferred,
                    App.fileInstanceCollection.deferred,
                    App.responseCollection.deferred
                ).then(function () {

                    ///
                    /// success - Main code goes here
                    /// 

                    console.log("All files fetched");

                    // if no questionId is passed in goto the first question
                    if (questionId === undefined || questionId == "-200") {

                        // are we passing in the sid (server id) int
                        // or the id (client id) string
                        var fileId;
                        var fileInstType;

                        fileId = parseInt(fileInstanceId);
                        fileInstType = "server";
                        fileId = App.fileInstanceCollection.where({ id: fileId });
                        console.log("fileInstType: server");
                        console.log(fileId);

                        fileId = fileId[0].get("fileId");
                        var firstQuestionId = App.uQuestionCollection.where({ fileId: parseInt(fileId), order: 1 });
                        firstQuestionId = firstQuestionId[0].get("sid");
                        var goto = "#go?file" + fileInstanceId + "?q" + firstQuestionId + "?edit";
                        questionId = firstQuestionId;
                        App.router.navigate(goto, { replace: true });
                        $("#panelGo").panel("open");

                    }

                    //existing view
                    if (App.goCompositeView) {

                        // re-fetch questions from cache and re-render
                        console.log("fetched the uQuestionCollection ==> existing");
                        $.mobile.loading("hide");
                        App.goCompositeView.questionId = questionId;
                        App.goCompositeView.fileInstanceId = fileInstanceId;
                        App.goCompositeView.fileInstColl = App.fileInstanceCollection; // pass in the file instance collection
                        App.goCompositeView.responseColl = App.responseCollection; // pass in the responses collection
                        App.goCompositeView.edit = "?edit"; //append edit to the route
                        App.goCompositeView.render();

                    }
                    // new view
                    else {

                        // create a Go Compostite View 
                        App.goCompositeView = new GoCompositeView();

                        $.mobile.loading("hide");
                        console.log("fetched the uQuestionCollection ==> new");
                        App.goCompositeView.questionId = questionId;
                        App.goCompositeView.fileInstanceId = fileInstanceId;
                        App.goCompositeView.fileInstColl = App.fileInstanceCollection; // pass in the file instance collection
                        App.goCompositeView.responseColl = App.responseCollection; // pass in the responses collection
                        App.goCompositeView.edit = "?edit"; //append edit to the route
                        App.goCompositeView.render();

                    }

                    ///
                    /// End Success
                    ///

                }, function () {
                    //error
                    console.log("Error fetching files");
                });

            }
            // regular user edit view
            else {
                // make sure all the files are loaded
                // assume the collections all exist in all sub views
                $.when(
                    App.uQuestionCollection.deferred,
                    App.uFileInstanceCollection.deferred,
                    App.uFileCollection.deferred,
                    App.uResponseCollection.deferred,
                    App.uOptionCollection.deferred
                ).then(function () {

                    ///
                    /// success - Main code goes here
                    /// 

                    console.log("All files fetched");

                    // if no questionId is passed in goto the first question
                    if (questionId === undefined) {

                        // are we passing in the sid (server id) int
                        // or the id (client id) string
                        var fileId;
                        var fileInstType;
                        if (App.isClientId(fileInstanceId)) { // working offline with id (client id) 
                            fileInstType = "client";
                            fileId = App.uFileInstanceCollection.where({ id: fileInstanceId });
                            console.log("fileInstType: client");
                            console.log(fileId);
                        }
                        else {   // working online with sid (server Id) 
                            fileId = parseInt(fileInstanceId);
                            fileInstType = "server";
                            fileId = App.uFileInstanceCollection.where({ sid: fileId });
                            console.log("fileInstType: server");
                            console.log(fileId);
                        }


                        fileId = fileId[0].get("fileId");
                        var firstQuestionId = App.uQuestionCollection.where({ fileId: parseInt(fileId), order: 1 });
                        firstQuestionId = firstQuestionId[0].get("sid");
                        var goto = "#go?file" + fileInstanceId + "?q" + firstQuestionId;
                        questionId = firstQuestionId;
                        App.router.navigate(goto, { replace: true });
                        $("#panelGo").panel("open");

                    }



                    //existing view
                    if (App.goCompositeView) {

                        // re-fetch questions from cache and re-render
                        console.log("fetched the uQuestionCollection ==> existing");
                        $.mobile.loading("hide");
                        App.goCompositeView.questionId = questionId;
                        App.goCompositeView.fileInstanceId = fileInstanceId;
                        App.goCompositeView.fileInstColl = App.uFileInstanceCollection; // pass in the file instance collection
                        App.goCompositeView.responseColl = App.uResponseCollection; // pass in the responses collection
                        App.goCompositeView.edit = ""; //do not append anything to the route since we are not editing
                        App.goCompositeView.render();

                    }
                        // new view
                    else {

                        // create a Go Compostite View 
                        App.goCompositeView = new GoCompositeView();

                        $.mobile.loading("hide");
                        console.log("fetched the uQuestionCollection ==> new");
                        App.goCompositeView.questionId = questionId;
                        App.goCompositeView.fileInstanceId = fileInstanceId;
                        App.goCompositeView.fileInstColl = App.uFileInstanceCollection; // pass in the file instance collection
                        App.goCompositeView.responseColl = App.uResponseCollection; // pass in the responses collection
                        App.goCompositeView.edit = ""; //do not append anything to the route since we are not editing
                        App.goCompositeView.render();

                    }

                    ///
                    /// End Success
                    ///

                }, function () {
                    //error
                    console.log("Error fetching files");
                });

            }
          
        },

        /// <summary>
        /// The admin view that allows you to add a user profile to an org
        /// </summary>
        profile: function (orgId) {

            // show dom ele
            $.mobile.changePage("#profile", { reverse: false, changeHash: false });

            // SHOW the side menu
            // set the orgId for the global variable used by the collection 
            // for GET /api/OrgUserMapping/<App.tempOrgId> as well as the 
            // /#build, /#report and /#settings pages
            App.orgId = orgId;
            //$("[data-role='admin-menu']").html( _.template(AdminMenuTemplate, { orgId: App.orgId, profileSelected: " data-theme='c' data-icon='false' " }) );
            $("[data-role='admin-menu']").html(_.template(NavBarTemplate, { orgId: App.orgId, profileSelected: "ui-btn-active" }));
            $("#profile").trigger("create");
            

            var self = this;
            
            $.mobile.loading("show");
            // existing view
            if (App.userCompositeView) {

                // simply re-render the view if it already exists
                App.userCompositeView.render(orgId);
                App.userOrgCollection.fetch({
                    success: function () {
                        // triggger re-style
                        $("#profile").trigger("create");
                        $.mobile.loading("hide");
                    }
                });

            }
            // non existing view
            else {

                // Orgs Users Collection
                App.userOrgCollection = new UserOrgCollection();

                App.userCompositeView = new UserCompositeView();
                App.userCompositeView.render(orgId);
                App.userOrgCollection.fetch({
                    success: function () {
                        // triggger re-style
                        $("#profile").trigger("create");
                        $.mobile.loading("hide");
                    }
                });

            }

        },

        /// <summary>
        /// The build view allows you to build a new survey or edit one
        /// </summary>
        build: function (orgId) {

            // show dom ele
            $.mobile.changePage("#build", { reverse: false, changeHash: false });
            $.mobile.loading("show");

            // set the orgId for the global variable used by the collection 
            // for GET /api/OrgUserMapping/<App.tempOrgId> as well as the 
            // /#build, /#report and /#settings pages
            App.orgId = orgId;
            App.orgName = App.defaultOrgName;

            // show the side menu
            //var t = _.template(AdminMenuTemplate, { orgId: App.orgId, buildSelected: " data-theme='c' data-icon='false' " });
            var t = _.template(NavBarTemplate, { orgId: App.orgId, buildSelected: "ui-btn-active" });
            $("[data-role='admin-menu']").html(t);
            $("#build").trigger("create");

            // clear the file collection
            $("#fileList").html("");

            var self = this;
                       

            $.when(
                  App.fileCollection.deferred
            ).then(function () {
                //success

                if (!App.fileBuilderCompositeView) App.fileBuilderCompositeView = new FileBuilderCompositeView();
                App.fileCollection.fetch({
                    success: function () {
                        // triggger re-style
                        $("#build").trigger("create");
                        $.mobile.loading("hide");
                    }
                });

            }, function () {
                //error
                $.mobile.loading("hide");
                console.log("Error fetching files on init");
            });

           

        },

        /// <summary>
        /// The build view allows you to build a new survey or edit one
        /// </summary>
        file: function (fileId) {

            // show dom ele
            $.mobile.changePage("#file", { reverse: false, changeHash: false });

            App.fileId = fileId;

            // show the side menu
            //var t = _.template(AdminMenuTemplate, { orgId: App.orgId, buildSelected: " data-theme='c' data-icon='false' " });
            $("[data-role='admin-menu']").html( _.template(NavBarTemplate, { orgId: App.defaultOrg, buildSelected: "ui-btn-active" }) );
            $("#file").trigger("create");

            // clear the file collection and publish date
            $("#questionList").html("");
            $("#lastPublished").html("");

            var self = this;

            $.mobile.loading("show");
            $.when(
                  App.fileCollection.deferred
            ).then(function () {
                //success
                
               
                // existing collection
                if (App.questionCollection) {

                    // simply re-render the view if it already exists
                    //App.fileBuilderCompositeView.render(orgId);

                    if (!App.fileCompositeView) App.fileCompositeView = new FileCompositeView();
                    App.fileCompositeView.renderBreadcrumbs();
                    App.questionCollection.fetch({
                        success: function () {
                            // triggger re-style
                            $.mobile.loading("hide");
                            $("#file").trigger("create");
                        }
                    });

                }
                // new collection
                else {
                    // Survey Collection
                    App.questionCollection = new QuestionCollection();
                    App.questionCollection.comparator = function (question) {
                        return question.get("order");
                    };

                    App.fileCompositeView = new FileCompositeView();
                    //App.fileBuilderCompositeView.render(orgId);
                    App.fileCompositeView.renderBreadcrumbs();
                    App.questionCollection.fetch({
                        success: function () {
                            // triggger re-style
                            $.mobile.loading("hide");
                            $("#file").trigger("create");
                        }
                    });

                }

            }, function () {
                //error
                $.mobile.loading("hide");
                console.log("Error fetching files on init");
            });


        },

        /// <summary>
        /// Question View for editing a question
        /// </summary>
        question: function (questionId) {

            App.questionId = questionId;

            // show dom ele
            $.mobile.changePage("#question", { reverse: false, changeHash: false });
          
            // show the nav menu
            $("[data-role='admin-menu']").html(_.template(NavBarTemplate, { orgId: App.defaultOrg, buildSelected: "ui-btn-active" }));
            $("#question").trigger("create");

            
            // fetch the question collection if it has not been fetched yet
            $.mobile.loading("show");
            $.when(
                  App.fileCollection.deferred
            ).then(function () {

                //success
                $.mobile.loading("hide");

                ///
                /// Function to Run determining GPS/Camer/MC view etc...
                ///
                    App.qLogic = function (questionId) {
                        // get the data from the collection
                        var model = App.questionCollection.get(questionId);
                        var type = model.get("type");
                        var questionTitle = model.get("question");
                        var fileId = parseInt(App.fileId);
                        var surveyName = App.fileCollection.get(fileId);
                        surveyName = surveyName.get("fileName");

                        try{
                            questionTitle = questionTitle.substring(0, 16) + "...";
                        }
                        catch (e) {
                            questionTitle = "Question...";
                        }
                        
                       

                        // render the breadcrumbs
                        $("[data-role='breadcrumbs']").html(
                            '<div data-role="controlgroup" data-type="horizontal" data-mini="true" data-theme="b">'+
                                '<a data-role="button" data-icon="chevron-right" data-iconpos="right" href="#build?'+ App.defaultOrg +'" >Survey Builder</a>' +
                                '<a data-role="button" data-icon="chevron-right" data-iconpos="right" href="#file?' + App.fileId + '" >' + surveyName + '</a>' +
                                '<a data-role="button" data-icon="chevron-right" data-iconpos="right" class="ui-btn-active" >' + questionTitle + '</a>' +
                            '</div>'
                        );
                    

                        if (type == "SingleAnswer" || type == "MultipleChoice") {

                            // new QOptionAnswerView
                            if (!App.qOptionAnswerView) {
                                App.qOptionAnswerView = new QOptionAnswerView();
                                App.qOptionAnswerView.render(model);
                            }
                                // existing QOptionAnswerView
                            else {
                                App.qOptionAnswerView.render(model);
                            }

                        }
                        else if (type == "OpenEnded") {

                            // new QOpenEndedView
                            if (!App.qOpenEndedView) {
                                App.qOpenEndedView = new QOpenEndedView();
                                App.qOpenEndedView.render(model);
                            }
                                // existing QOpenEndedView
                            else {
                                App.qOpenEndedView.render(model);
                            }

                        }
                        else if (type == "Gps") {

                            // new QGpsView
                            if (!App.qGpsView) {
                                App.qGpsView = new QGpsView();
                                App.qGpsView.render(model);
                            }
                                // existing QGpsView
                            else {
                                App.qGpsView.render(model);
                            }

                        }
                        else if (type == "Camera") {

                            // new CameraView
                            if (!App.qCameraView) {
                                App.qCameraView = new QCameraView();
                                App.qCameraView.render(model);
                            }
                                // existing QGpsView
                            else {
                                App.qCameraView.render(model);
                            }

                        }
                        else if (type == "Signature") {

                            // new QSignatureView
                            if (!App.qSignatureView) {
                                App.qSignatureView = new QSignatureView();
                                App.qSignatureView.render(model);
                            }
                                // existing QGpsView
                            else {
                                App.qSignatureView.render(model);
                            }

                        }

                    };

            ///
            /// Function to run after we know the fileId this question belongs to
            ///
                App.qGo = function () {
                    // existing collection
                    if (App.questionCollection) {

                        App.questionCollection.fetch({
                            success: function () {
                                App.qLogic(questionId);
                            }
                        });

                    }
                    // new collection
                    else {
                        // Survey Collection
                        App.questionCollection = new QuestionCollection();
                        App.questionCollection.comparator = function (question) {
                            return question.get("order");
                        };

                        //App.fileCompositeView = new FileCompositeView();
                        App.questionCollection.fetch({
                            success: function () {
                                App.qLogic(questionId);
                            }
                        });

                    }

                };


                ///
                /// Kick Start it
                ///
                    // what file does this question belong to?
                    if (!App.fileId) {
                        // if we dont know the file this question belong to we must look it up
                        var url = App.utils.urlify("QuestionLookup/" + questionId);
                        var fbToken = App.user.get("access_token");
                        var apiToken = $("#__ApiToken").val();

                        $.ajax(url, {
                            type: "GET",
                            contentType: "application/json",
                            data: {},
                            dataType: "json",
                            headers: {
                                'ApiToken': apiToken,
                                'FbToken': fbToken
                            },
                            success: function (data) {
                                App.fileId = data.File.id;
                                App.qGo();
                            }
                        });
                    }
                    else { // we already know the fileId
                        App.qGo();
                    }


  
            }, function () {
                //error
                $.mobile.loading("hide");
                console.log("Error fetching files on init");
            });



        },

        /// <summary>
        /// The admin view that shows all the organization you own
        /// </summary>
        admin: function () {

            console.log("====> admin");

            // show dom ele
            $.mobile.changePage("#admin", { reverse: false, changeHash: false });


            // create view if it hasn't aleaready been created
            if (App.orgCompositeView) {
                
            }
            else {
                
                // collection
                App.orgCollection = new OrgCollection();

                // Org View 
                App.orgCompositeView = new OrgCompositeView();
                
                // style
                $("#admin").trigger("create");

            }

            // if the user is a system admin then load the user manager
            if (App.isSystemAdmin) {

                if (App.userManagerView) {
                    App.userManagerView.render().done(function () {
                        // style
                        $("#admin").trigger("create");
                    });
                }
                else {

                    App.userManagerView = new UserManagerView();
                    App.userManagerView.render().done(function () {
                        // style
                        $("#admin").trigger("create");
                    });

                }

            }


        },

        /// <summary>
        /// The is a hidden route #coll that prints the localStorage out
        /// </summary>
        coll: function () {

            console.log("====> coll");

            // show dom ele
            $.mobile.changePage("#coll", { reverse: false, changeHash: false });

            if (!App.collView) {
                App.collView = new CollView();
                App.collView.render();
                $("#coll").trigger("create");
            }
            else {
                App.collView.render();
                $("#coll").trigger("create");
            }

            

        },

        importer: function (id) {

            $.mobile.changePage("#importer", { reverse: false, changeHash: false });

            $.when(
                App.fileCollection.deferred
            ).then(function () {

                /// success - Main code goes here

                if (!App.importView) {
                    App.importView = new ImportView();
                    App.importView.qid = id;
                    App.importView.render();
                }
                else {
                    App.importView.qid = id;
                    App.importView.render();
                }


            }, function () {
                //error
                console.log("Error fetching files");
            });


        },

        // Test method
        tutorial: function () {

            console.log("====> tutorial");

            // show dom ele
            $.mobile.changePage("#tutorial", { reverse: false, changeHash: false });

            if (!App.tutorialView) {


                function scale(width, height, padding, border) {
                    var scrWidth = $(window).width() - 30,
                        scrHeight = $(window).height() - 30,
                        ifrPadding = 2 * padding,
                        ifrBorder = 2 * border,
                        ifrWidth = width + ifrPadding + ifrBorder,
                        ifrHeight = height + ifrPadding + ifrBorder,
                        h, w;

                    if (ifrWidth < scrWidth && ifrHeight < scrHeight) {
                        w = ifrWidth;
                        h = ifrHeight;
                    } else if ((ifrWidth / scrWidth) > (ifrHeight / scrHeight)) {
                        w = scrWidth;
                        h = (scrWidth / ifrWidth) * ifrHeight;
                    } else {
                        h = scrHeight;
                        w = (scrHeight / ifrHeight) * ifrWidth;
                    }

                    return {
                        'width': w - (ifrPadding + ifrBorder),
                        'height': h - (ifrPadding + ifrBorder)
                    };
                };

                $("#popupVideo iframe").attr("width", 0).attr("height", 0);

                $("#popupVideo").on({
                    popupbeforeposition: function () {
                        var size = scale(497, 298, 15, 1),
                            w = size.width,
                            h = size.height;

                        $("#popupVideo iframe")
                            .attr("width", w)
                            .attr("height", h);
                    },
                    popupafterclose: function () {
                        $("#popupVideo iframe")
                            .attr("width", 0)
                            .attr("height", 0);
                    }
                });

                $("#popupVideo2 iframe").attr("width", 0).attr("height", 0);

                $("#popupVideo2").on({
                    popupbeforeposition: function () {
                        var size = scale(497, 298, 15, 1),
                            w = size.width,
                            h = size.height;

                        $("#popupVideo2 iframe")
                            .attr("width", w)
                            .attr("height", h);
                    },
                    popupafterclose: function () {
                        $("#popupVideo2 iframe")
                            .attr("width", 0)
                            .attr("height", 0);
                    }
                });

                App.tutorialView = true;
            }

            $("#tutorial").trigger("create");

        },

        // Test method
        test: function () {

            console.log("====> test");

            // show dom ele
            $.mobile.changePage("#test", { reverse: false, changeHash: false });


            $("#test").trigger("create");


            // create view if it hasn't aleaready been created
            if (App.menuView) {

            }
            else {
                // Menu View 
                App.menuView = new MenuView();
                App.menuView.firstLoad();

                console.log("====> after menu");

                // test phone gap gps
                var onSuccess = function (position) {
                    var strGPS = '<img src="https://maps.googleapis.com/maps/api/staticmap?center=' + position.coords.latitude + ' ' + position.coords.longitude + '&amp;zoom=14&amp;size=288x200&amp;markers=color:blue%7Clabel:X%7C' + position.coords.latitude + ' ' + position.coords.longitude + '&amp;sensor=false" height="200" width="288">';
                    var strgps = 'Latitude: ' + position.coords.latitude + '<br/>' + 'Longitude: ' + position.coords.longitude + '<br/>' + 'Altitude: ' + position.coords.altitude + '<br/>' + 'Accuracyy: ' + position.coords.accuracy + '<br/>' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br/>' + 'Heading: ' + position.coords.heading + '<br/>' + 'Speed: ' + position.coords.speed + '<br/>' + 'Timestamp: ' + position.timestamp + '<br/>';
                    $('.gps-data').html(strGPS + "<br/>" + strgps);
                };
                var onError = function (error) {
                    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                };
                navigator.geolocation.getCurrentPosition(onSuccess, onError);

                // style
                $("#test").trigger("create");

            }

            console.log("====> / end test");

        }


    });

    // Returns the Router class
    return Router;

} );
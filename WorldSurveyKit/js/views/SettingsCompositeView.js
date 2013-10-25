// Settings Composite  View
// ==========================

define(["jquery", "backbone", "models/Models", "collections/UFileCollection"],
    function ($, Backbone, Models, UFileCollection) {

    // Extends Backbone.View
    var SettingsCompositeView = Backbone.View.extend({

        el: "#settings .main-content",

        events: {
            "click #settingsSyncAll": "syncAll_ONCLICK",
            "click #settingsSave": "settingsSave_ONCLICK",
            "click #settingsReload": "reloadAll_ONCLICK",
            "click #settingsAddOrg": "addOrg_ONCLICK",
            "click #settingsReloadApp": "reloadApp_ONCLICK"
            
        },

        initialize: function() {

            console.log("====> SettingsCompositeView - init()");

        },

        render: function () {
            
            console.log("====> SettingsCompositeView - render()");

            $("#settingsList").html("<fieldset id='settingsListGroup' data-role='controlgroup'></fieldset>");
            $("#settingsList").trigger("create");

            $("#helpPage").attr("href", App.helpPage);

            // load the radio check list with orgs
            _.each(App.myOrgs, function (org) {

                if (org.Orgs.id == 1){
                    // dont show to world survey kit defualt org
                    if (App.myOrgs.length == 1) {
                        $("#settingsListGroup").after("<p>You are not a member of any organizations</p>");
                    }
                }
                else {

                    if (org.Users.defaultOrg == org.Orgs.id) {
                        $("#settingsListGroup").append(
                            '<input type="radio" name="radio-settings-group" id="radio-settings-group-' + org.Orgs.id + '" value="' + org.Orgs.id + '" checked="checked">' +
                            '<label for="radio-settings-group-' + org.Orgs.id + '">' + org.Orgs.orgName + '</label>'
                        );
                    }
                    else {
                        $("#settingsListGroup").append(
                            '<input type="radio" name="radio-settings-group" id="radio-settings-group-' + org.Orgs.id + '" value="' + org.Orgs.id + '">' +
                            '<label for="radio-settings-group-' + org.Orgs.id + '">' + org.Orgs.orgName + '</label>'
                        );
                    }

                }

            });

           
            this.syncCount();

            return this;

        },

        syncAll_ONCLICK: function (e) {

            var self = this;

            //sync all the file instances first
            var results = App.uFileInstanceCollection.storage.sync.pushFull(function () {
                console.log("syncing file inst...");
                // now sync all the responses
                App.uResponseCollection.storage.sync.pushFull(function () {
                    // update the sync count
                    self.syncCount();
                });
            });

            console.log("results");
            console.log(results);

            // if there are no new file instance simply sync the repsonses
            if (results.length == 0) {    
                console.log("no file inst to sync, syncing responses...");
                App.uResponseCollection.storage.sync.pushFull(function () {
                    // update the sync count
                    self.syncCount();
                });
            }
           

        },

        // reload all aka reset app, be carefull you will lose unsaved data and it will be replaced with server data
        reloadAll_ONCLICK: function (e) {

            $.mobile.loading("show");
            
            var self = this;

 
            // we pass in the url if sync is overridden on the collection, most of the time GET is overridden
            if (App.uQuestionCollection) {
                var questionDfd =  App.uQuestionCollection.storage.sync.full({ url: App.utils.urlify("UQuestionCollection/" + App.defaultOrg) }).done(function () {
                    $.mobile.loading("hide");
                });

            }

            if (App.uFileInstanceCollection) {
              
                var fileInstDfd = App.uFileInstanceCollection.storage.sync.full().done(function () {
                    $.mobile.loading("hide");
                });

            }

            if (App.uResponseCollection) {

                var respDfd = App.uResponseCollection.storage.sync.full().done(function () {
                    $.mobile.loading("hide");
                    self.syncCount();
                });
            }

            var waitDfd = $.wait(4000);

           
            var promise = Q.all([
               questionDfd,
               fileInstDfd,
               respDfd,
               waitDfd
            ]);

            promise.then(function () {
                console.log("clearing local storage");
                window.localStorage.clear();
                window.location.reload();
            });

        },



        settingsSave_ONCLICK: function (e) {

            var orgId = $("#settingsListGroup :radio:checked").val();
            var url = App.utils.urlify("whoami/" + App.id);
            var orgName;
            _.each(App.myOrgs, function (org) {
                console.log(org);
                if (org.orgsId == orgId) {
                    orgName = org.Orgs.orgName;

                }
                else {

                }
            });
            
            $.mobile.loading("show");

            // save the default Org
            $.ajax(url, {
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ defaultOrg: orgId }),
                dataType: "json",
                success: function (data) {
                    $.mobile.loading("hide");

                    window.location.reload();

                },
                error: function (model, response) {
                    $.mobile.loading("hide");
                    alert(response.statusText);
                }

            });
            
        },

        reloadApp_ONCLICK: function(){

            window.location.reload();

        },

        addOrg_ONCLICK: function () {


        },

        syncCount: function () {
            var isDirt = "";
            var val;
            var value;
            var syncCount = 0;
            for (var i in window.localStorage) {

                val = localStorage.getItem(i);
                value = val.split(","); //splitting string inside array to get name
                name[i] = value[1]; // getting name from split string

                isDirt = "";
                try {
                    isDirt = $.parseJSON(val).dirty;
                    if (isDirt == true) {
                        syncCount++;
                    }
                }
                catch (e) {
                    isDirt = "";

                }

            }
            if (syncCount > 0) {
                var plural = "items";
                if (syncCount == 1) plural = "item";

                $("#syncCount").html("*Note - this will save all unsaved data. <span style='color:red'> " + syncCount + " " + plural + " pending sync. </span>");
            }
            else {
                $("#syncCount").html("*Note - this will save all unsaved data. <span style='color:green'>" + syncCount + " items pending sync. </span>");
            }
        }


    });

    return SettingsCompositeView;

});
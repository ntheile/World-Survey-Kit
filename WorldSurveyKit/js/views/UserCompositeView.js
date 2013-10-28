// User Composite  View
// ==========================

define(["jquery", "backbone", "models/Models", "views/UserItemView", "tdfriendselector"],
    function ($, Backbone, Models, UserItemView, tdfriendselector) {
      
    // Extends Backbone.View
    var UserCompositeView = Backbone.View.extend({

        el: "#profile .main-content",

        events: {
            "click #addUserFBID": "addUser_ONCLICK"
        },

        isNewUser: false,

        // The View Constructor
        initialize: function() {

            console.log("====> UserCompositeView - init()");

            // bind to  events
            App.userOrgCollection.on("reset", this.addAll, this);
            App.userOrgCollection.on("add", this.addOneItem, this);
          
            // click events
            $("#profileAdd").on("click", this.addUserSubmit_ONCLICK);

            var self = this;

            // bind to collapsible events
            $(".addExistingUser").on("expand", function () {
                self.isNewUser = false;
                self.existExpanded = true;
            });
            $(".addExistingUser").on("collapse", function () {
                self.isNewUser = true;
                self.existExpanded = false;
            });
            $(".addNewUser").on("expand", function () {
                self.isNewUser = true;
                self.newExpanded = true;
            });
            $(".addNewUser").on("collapse", function () {
                self.isNewUser = false;
                self.newExpanded = false;
            });





            // facebook friend picker
            App.fbPicker = "";
            var logActivity, callbackFriendSelected, callbackFriendUnselected, callbackMaxSelection, callbackSubmit;

           
            // When the user clicks OK, log a message
            callbackSubmit = function (selectedFriendIds) {

                self.addFBUserSubmit_ONCLICK();
                
            };

            // Initialise the Friend Selector with options that will apply to all instances
            TDFriendSelector.init({ debug: true });

            // Create some Friend Selector instances
            App.fbPicker = TDFriendSelector.newInstance({
                callbackSubmit: callbackSubmit,
                friendsPerPage: 5,
                maxSelection: 500,
                autoDeselection: true
            });

            $("#TDFriendSelectorClear").click(function (e) {
                App.fbPicker.hideFriendSelector();
                $("#addUser").click();
            });


            $("#addUser").click(function (e) {
                e.preventDefault();
                App.fbPicker.reset();
                App.fbPicker.showFriendSelector();
            });

            $("#profileAdd").click(function (e) {
                self.addFBUserById();
            });

           


            logActivity = function (message) {
                console.log('<div>' + new Date() + ' - ' + message + '</div>');
            };

           
        },

        render: function (orgId) {
            
            console.log("====> UserCompositeView - render()");

            //get the org name

            if (App.popOpenAddUser) {
                $("#addUser").click();
                App.popOpenAddUser = false;
            }

            // temp stuff
            var u = App.utils.urlify("orgs/" + orgId);
            $.get(u, function (data) {
                $("#orgName").html("<b>" + data.orgName + "</b>");
            });

           
            return this;

        },

        _addOne: function (model) {

            console.log("====> UserCompositeView - addOne()");

            var view = new UserItemView({ model: model });

            $('#orgUsers').append(view.render().el);

            $('#orgUsers').listview("refresh");


        },

        addOneItem: function (model) {

            this._addOne(model);
 
        },


        addAll: function (orgCollection) {

            console.log("====> UserCompositeView - addAll()");

            // get the users
            $("#orgUsers").html("");

            App.userOrgCollection.each(this._addOne, this);
           
        },

        
        addUser_ONCLICK: function (e) {

            App.fbPicker.hideFriendSelector();

            $("#addUserPopup").popup("open");


        },


        addFBUserById: function () {

            console.log("addFbuserByUD");

            var self = this;

            App.fbPicker.reset();

            var fid = $("#select-new-fbid").val();
            $("#fb-user-admin").val( $(".isOrgAdmin-New").val() );

            FB.api('/' + fid, function (response) {
                var name = response.name;
                var ary = [];
                ary.push({
                    fid: fid,
                    name: name
                });

                App.fbPicker.getselectedFriends = function () {
                    return ary;
                };

                $("#addUserPopup").popup("close");

                self.addFBUserSubmit_ONCLICK();


            });
            

        },

        addFBUserSubmit_ONCLICK: function (e) {

            var self = this;

            // save new user to the collection

            var orgId = App.userOrgCollection.at(0).get("orgsId");
            var isAdmin;
            var userCollection = App.fbPicker.getselectedFriends();
            var json = [];

            var url = App.utils.urlify("FBUsers");
            var defaultOrg = App.orgId;
            isAdmin = $("#fb-user-admin").val();
            if (isAdmin == "yes") {
                isAdmin = true;
            }
            else {
                isAdmin = false;
            }


            // build json bundle
            _.each(userCollection, function (user) {
                json.push({
                    fbUserId: user.fid,
                    name: user.name,
                    isSystemAdmin: isAdmin,
                    defaultOrg: defaultOrg
                });
            });


            // create / verify a new user account to the org survey
            $.ajax(url, {
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(json),
                success: function (data, textStatus, jqXHR) {
                    App.router.profile(App.orgId);

                    // now send them a msg
                    FB.ui({
                        method: 'apprequests',
                        message: 'New Survey ready to take on World Survey Kit. http://worldsurveykit.com',
                        to: App.fbPicker.getselectedFriendIds()
                    });

                },
                error: function (data, textStatus, jqXHR) {
                    alert("Error - " + textStatus.statusText);
                }

            });

            $("#addUserPopup").popup("close");
  
        }

    });

    return UserCompositeView;

});
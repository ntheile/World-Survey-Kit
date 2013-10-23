// User Composite  View
// ==========================

define(["jquery", "backbone", "models/Models", "views/UserItemView"],
    function ($, Backbone, Models, UserItemView) {
      
    // Extends Backbone.View
    var UserCompositeView = Backbone.View.extend({

        el: "#profile .main-content",

        events: {
            "click #addUser": "addUser_ONCLICK"
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
           
        },

        render: function (orgId) {
            
            console.log("====> UserCompositeView - render()");

            //get the org name

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

            $("#addUserPopup").popup("open");
 
            // populate the drop down with existing users
            $("#select-exisiting-user").html("");
            var u = App.utils.urlify("users");
            var i = 1;
            $.get(u, function (data) {
                
                _.each(data, function (data) {
                    if (i == 1) {
                        console.log("1");
                        $("#select-exisiting-user").append("<option selected='selected' value='" + data.id + "'>" + data.name + "&nbsp;|&nbsp;" + data.fbUserId + "</option>");
                    }
                    else{
                        $("#select-exisiting-user").append("<option value='" + data.id + "'>" + data.name + "&nbsp;|&nbsp;" + data.fbUserId + "</option>");
                    }
                    i = 2;
                    
                });

                $("#select-exisiting-user").selectmenu("refresh", true);

            });

           

   
        },

        addUserSubmit_ONCLICK: function (e) {

            // save new user to the collection

            var orgId = App.userOrgCollection.at(0).get("orgsId");
            var isAdmin;
            // add new user
            if ((App.userCompositeView.isNewUser == true) && (App.userCompositeView.newExpanded == true)) {

                var name = $("#select-new-user").val();
                var fbId = $("#select-new-fbid").val();
                var url = App.utils.urlify("users");
                var defaultOrg = App.orgId;
                isAdmin = $(".isOrgAdmin-New").val();
                if (isAdmin == "Yes") {
                    isAdmin = true;
                }
                else {
                    isAdmin = false;
                }

                // create a new user account
                $.ajax(url, {
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify({ fbUserId: fbId, name: name, isSystemAdmin: false, defaultOrg: defaultOrg }),
                    success: function(data, textStatus, jqXHR) {

                        // assign to org
                        App.userOrgCollection.create({
                            name: 'placeholder',
                            usersId: data.id,
                            isOrgAdmin: isAdmin,
                            orgsId: orgId
                        },{
                            wait: true,

                            success: function (data, textStatus, jqXHR) {


                            },

                            error: function (jqXHR, textStatus, errorThrown) {
                                alert("Error - " + textStatus.statusText);
                            }

                        });


                    },
                    error: function (data, textStatus, jqXHR) {
                        alert("Error - " + textStatus.statusText);
                    }

                });
                    
                $("#addUserPopup").popup("close");
            }
            // add existing user
            else if (App.userCompositeView.isNewUser == false && App.userCompositeView.existExpanded == true) {

                var uid = $("#select-exisiting-user").val();
                isAdmin = $(".isOrgAdmin-Existing").val();
                if (isAdmin == "Yes") {
                    isAdmin = true;
                }
                else {
                    isAdmin = false;
                }


                App.userOrgCollection.create({
                    name: 'placeholder',
                    usersId: uid,
                    isOrgAdmin: isAdmin,
                    orgsId: orgId
                },{

                    wait: true,

                    success: function (data, textStatus, jqXHR) {

                    },

                    error: function (jqXHR, textStatus, errorThrown) {
                        alert("Error - " + textStatus.statusText);
                    }

                });
                
                $("#addUserPopup").popup("close");

            }
            else {
                alert("Error - You must choose and expand at least one option");
            }

        }

    });

    return UserCompositeView;

});
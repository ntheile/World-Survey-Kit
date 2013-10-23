// User Item View
// =============

define(["jquery", "backbone", "models/Models", "text!templates/UserOrgItemTemplate.html", "text!templates/UserEditPopupTemplate.html"],
    function ($, Backbone, Models, Template, PopupTemplate) {

    // Extends Backbone.View
    var UserItemView = Backbone.View.extend({

        tagName: "li",

        template: _.template(Template),

        events: {
            "click .editUser": "editUser_ONCLICK"
        },


        initialize: function() {

            console.log("======> UserItemView - Init()");

            this.model.on("add", this.render, this);
            
        },

        render: function () {

            console.log("====> UserItemView - render()");

            console.log(this.model.toJSON());

            this.$el.attr("data-icon", "pencil");

            this.$el.html(this.template(this.model.toJSON()));

            return this;

        },
        

        editUser_ONCLICK: function () {

            console.log("=====> edit User ");

            var $popupEl = "#edit-user-" + this.model.get("id");
            var $flipEl = "#flip-edit-user-adm-" + this.model.get("id");
            var $editUser = "#edit-user-submit-" + this.model.get("id");
            var $deleteUser = "#delete-user-submit-" + this.model.get("id");
            var $cancelBtn = "#edit-user-cancel-" + this.model.get("id");

            // append a popup view to the <li> if one does not already exist
            if (!$($popupEl).length) {
                this.$el.append(_.template(PopupTemplate, this.model.attributes));
                $("#profile").trigger("create");
            }
            
            $($popupEl).popup("open");

            var isAdm = this.model.get("isOrgAdmin");
            if (isAdm) {
                $($flipEl).val("Yes").slider("refresh");
            }
            else {
                $($flipEl).val("No").slider("refresh");
            }

            var self = this;

            // bind to submit
            $($editUser).on("click", { self: self }, self.editUser_SUBMIT);

            // bind to delete
            $($deleteUser).on("click", { self: self }, self.deleteUser_SUBMIT);

            // bind to cancel 
            $($cancelBtn).on("click", { self: self }, self.cancelBtn_CLICK);


        },

        editUser_SUBMIT: function(e) {

            var self = e.data.self;

            console.log(self);

            var $popupEl = "#edit-user-" + self.model.get("id");
            var $flipEl = "#flip-edit-user-adm-" + self.model.get("id");
            var $editUser = "#edit-user-submit-" + self.model.get("id");
            var $deleteUser = "#delete-user-submit-" + self.model.get("id");
            var $cancelBtn = "#edit-user-cancel-" + self.model.get("id");

            

            // get updated values from the DOM
            var isAdm = $($flipEl).val();
            if (isAdm == "Yes") {
                isAdm = true;
            }
            else {
                isAdm = false;
            }

            // PUT /api/orgusermapping/userProfileID
            self.model.save({ "isOrgAdmin": isAdm });

            self.dispose(e);

            $($popupEl).popup("close");

        },

        deleteUser_SUBMIT: function (e) {

            var self = e.data.self;

            console.log(self);

            var $popupEl = "#edit-user-" + self.model.get("id");
            var $flipEl = "#flip-edit-user-adm-" + self.model.get("id");
            var $editUser = "#edit-user-submit-" + self.model.get("id");
            var $deleteUser = "#delete-user-submit-" + self.model.get("id");
            var $cancelBtn = "#edit-user-cancel-" + self.model.get("id");

            $($deleteUser).off("click");

            var answer = confirm("Are you sure you want to delete this user?");
            if (answer) {

                // destroy the model

                self.model.destroy({
                    success: function (model, response) {

                        console.log("====> user destoyed successfully ");
                        console.log(response);

                        // unbind to prevent zombies

                        self.remove();
                        self.off();
                        self.model.off(null, null, this);

                        self.dispose(e);

                        try {
                            $('#orgUsers').listview("refresh");
                        }
                        catch (e) {
                        }

                        $($popupEl).popup("close");

                    },
                    error: function (model, response) {

                        console.log(response);

                        alert("Error - " + response.statusText);

                        $($popupEl).popup("close");

                    }

                }, { wait: true });

            }
            else {

                // unbind submit
                $($editUser).off("click");
                // unbind  delete
                $($deleteUser).off("click");
                // unbind cancel 
                $($cancelBtn).off("click");

                $($popupEl).popup("close");
            }

        },

        cancelBtn_CLICK: function (e) {

            var self = e.data.self;
            self.dispose(e);

        },

        // zombie killer
        dispose: function (e) {

            var self = e.data.self;

            console.log("dispose");
            //console.log(self);

            var $popupEl = "#edit-user-" + self.model.get("id");
            var $flipEl = "#flip-edit-user-adm-" + self.model.get("id");
            var $editUser = "#edit-user-submit-" + self.model.get("id");
            var $deleteUser = "#delete-user-submit-" + self.model.get("id");
            var $cancelBtn = "#edit-user-cancel-" + self.model.get("id");

            // unbind submit
            $($editUser).off("click");
            // unbind  delete
            $($deleteUser).off("click");
            // unbind cancel 
            $($cancelBtn).off("click");

        }


    });

    return UserItemView;

});
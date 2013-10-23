// User Row View 
// ====================

define(["jquery", "backbone", "models/Models", "text!templates/UserRowTemplate.html"],
    function ($, Backbone, Models, Template) {

    var UserRowView = Backbone.View.extend({

        tagName: "tr",

        template: _.template(Template),

        events: {
            'click .edit-table-row-user': 'editTableRow_ONCLICK',
            
        },

        initialize: function() {

            console.log("====> UserRowView - init()");

            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);

        },

        // Renders the entire view
        render: function () {
            
            this.$el.html(this.template(this.model.toJSON()));

            $("#admin").trigger("create");

            return this;

        },

        editTableRow_ONCLICK: function () {

            var name = this.model.get("name");
            var sysAdmin = this.model.get("isSystemAdmin");
            var id = this.model.get("id");

            $(".editUserTablePopupContent").html("");
            $(".editUserTablePopupContent").append(
                '<h3>Editing User - '+ name +'</h3>'+
                '<b>Name</b><input id="userTableInput-Name-' + id + '" value="' + name + '"></input>' +
                '<b>System Admin</b><input id="userTableInput-SysAdmin-' + id + '" value="' + sysAdmin + '"></input>' +
                '<br/><a class="editUserTablePopupSave" data-role="button" data-icon="save" data-inline="true" data-theme="b">Save</a>' +
                '<a class="editUserTablePopupDelete" data-role="button" data-icon="delete" data-inline="true" data-mini="true" data-theme="e">Delete User</a>'
            );
            
            $(".editUserTablePopup").popup("open");

            $(".editUserTablePopupContent").trigger("create");

            var self = this;

            // bind to save, delete and cancel
            $(".editUserTablePopupDelete").on("click", { self: self }, self.deleteRow_ONCLICK);
            $(".editUserTablePopupSave").on("click", { self: self }, self.updateRow_ONCLICK);
            $("#editUserTablePopupCancel").on("click", { self: self }, self.cancelRow_ONCLICK);

        },

        updateRow_ONCLICK: function (e) {

            var self = e.data.self;
            var id = self.model.get("id");
            var name = $('#userTableInput-Name-' + id).val();
            var sysAdmin = $('#userTableInput-SysAdmin-' + id).val();

            $.mobile.loading("show");
            self.model.save( {name: name,isSystemAdmin: sysAdmin }, {
                success: function (model, response) {
                    $.mobile.loading("hide");
                    self.disposePopup();
                    $(".editUserTablePopup").popup("close");
                    
                },
                error: function (model, response) {

                    $.mobile.loading("hide");
                       
                    alert("Error - " + response.statusText); 

                }
            }, { wait: true } );

        },

        deleteRow_ONCLICK: function (e) {

            var self = e.data.self;

            $.mobile.loading("show");
            self.model.destroy({
                success: function (model, response) {
                    $.mobile.loading("hide");
                    self.disposePopup();
                    $(".editUserTablePopup").popup("close");
                    self.dispose();
                },
                error: function (model, response) {

                    $.mobile.loading("hide");

                    alert("Error - " + response.statusText);

                }
            }, { wait: true });

        },

        cancelRow_ONCLICK: function (e) {

            var self = e.data.self;
            self.disposePopup();
        },

        disposePopup: function(){
            $(".editUserTablePopupDelete").off("click");
            $(".editUserTablePopupSave").off("click");
            $("#editUserTablePopupCancel").off("click");
        },

        dispose: function(){
            $(".edit-table-row-user").off("click");
        }

    });

    return UserRowView;

});
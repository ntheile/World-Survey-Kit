// File Builder Composite  View
// =============================

define(["jquery", "backbone", "models/Models"],
    function ($, Backbone, Models) {

        // Extends Backbone.View
        var FileBuilderCompositeView = Backbone.View.extend({

            el: "#build .main-content",

            events: {
                "click #newFile": "newFile_ONCLICK"
            },

            // The View Constructor
            initialize: function () {

                console.log("====> FileBuilderCompositeView - init()");

                var self = this;

                //// bind to  events
                App.fileCollection.on("reset", this.addAll, this);
                App.fileCollection.on("add", this.addOneItem, this);

                // click events
                $("#newFileSubmit").on("click", {self: self}, this.newFileSubmit_ONCLICK);


            },

            render: function (model) {

                console.log("====> FileBuilderCompositeView - render()");

                $('#fileList').append("<li data-icon='edit'>" +
                      "<a id='newSurvey" + model.get("id") + "' " +
                         "href='#file?" + model.get("id") +"'>" + model.get("fileName") +
                      "</a>" +
                   "</li>");

                $('#fileList').listview("refresh");

                return this;

            },

            _addOne: function (model) {

                console.log("====> FileBuilderCompositeView- addOne()");

                console.log(model);

                this.render(model);

            },

            addOneItem: function (model) {

                this._addOne(model);

            },


            addAll: function (orgCollection) {

                console.log("====> FileBuilderCompositeView - addAll()");

                // get the Files
                $("#fileList").html("");

                $("#surveyBuilderHeading").html("Survey Builder - " + App.orgName);

                App.fileCollection.each(this._addOne, this);

   
            },


            newFile_ONCLICK: function (e) {
                console.log("new file");
                $("#newFilePopup").popup("open");

            },

            newFileSubmit_ONCLICK: function (e) {

                var self = e.data.self;

                // save new file to the collection

                console.log("new file submitted");

                var orgId = App.orgId;
                var fileName = $("#newFileInput").val();

                if(fileName){
                    // add new file
                    App.fileCollection.create({
                        fileName: fileName,
                        orgsId: orgId
                    }, {

                        wait: true,

                        success: function (data, textStatus, jqXHR) {
                            // change the page to /#file?id
                            var fileId = data.get("id");
                            //App.router.navigate("file?" + fileId, { trigger: true });
                            var i = "#newSurvey" + fileId;
                            $(i)[0].click();
                        },

                        error: function (jqXHR, textStatus, errorThrown) {
                            alert("Error - " + textStatus.statusText);
                        }

                    });
                    


                    $("#newFilePopup").popup("close");

                }
                else{
                    alert("You must enter a name");
                }

            }

        });

        return FileBuilderCompositeView;

    });
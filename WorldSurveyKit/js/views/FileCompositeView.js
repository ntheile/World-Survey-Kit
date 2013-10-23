// File Composite Item View
// =========================


define(["jquery", "backbone", "models/Models"],
    function ($, Backbone, Models) {

        // Extends Backbone.View
        var FileCompositeView = Backbone.View.extend({

            el: "#file .main-content",

            events: {
                "click #deleteFile": "deleteFile_ONCLICK",
                "click #filePublish": "filePublish_ONCLICK",
                "click #newQuestion": "newQuestion_ONCLICK"  
            },


            // The View Constructor
            initialize: function () {

                console.log("====> FileCompositeView - init()");
                var self = this;

                // bind to  events
                App.questionCollection.on("reset", this.addAll, this);
                App.questionCollection.on("add", this.addOneItem, this);
                 
            },

            render: function (model) {

                console.log("====> FileCompositeView - render()");

                $('#questionList').append("<li data-icon='pencil'>" +
                   "<a href='#question?" + model.get("id") + "'>" + model.get("question") + "</a>" +
                   "</li>");

                $('#questionList').listview("refresh");

                return this;

            },

            renderBreadcrumbs: function() {

                var fileModel = App.fileCollection.get(App.fileId);
                var lastPublished = fileModel.get("updated_at");
                var fileName = fileModel.get("fileName") ;

                $("#questionList").html("");

                $("#fileEditorHeading").html("Editing - " + fileName);

                

                if (lastPublished == "null") {
                    $("#lastPublished").html("Last Published: never");
                }
                else {
                    $("#lastPublished").html("Last Published: " + lastPublished);
                }


                $("[data-role='breadcrumbs']").html(
                    '<div data-role="controlgroup" data-type="horizontal" data-mini="true" data-theme="b">' +
                       '<a data-role="button" data-icon="chevron-right" data-iconpos="right" href="#build?' + App.defaultOrg + '" >Survey Builder</a>' +
                       '<a data-role="button" data-icon="chevron-right" data-iconpos="right" class="ui-btn-active">' + fileName + '</a>' +
                   '</div>'
                );

                $("#file").trigger("create");

            },

            _addOne: function (model) {

                console.log("====> FileCompositeView- addOne()");

                console.log(model);

                this.render(model);


            },

            addOneItem: function (model) {

                this._addOne(model);

            },


            addAll: function (collection) {

                console.log("====> FileCompositeView - addAll()");

                // get the questions

                App.questionCollection.each(this._addOne, this);

            },

            deleteFile_ONCLICK: function () {

                // delete the file and destroy this view

                var model = App.fileCollection.get(App.fileId);
                var answer = confirm("Are you sure you want to delete  '" + model.get('fileName') + "' and all of it's associated data?");
                if (answer) {
                    model.destroy({
                        success: function (model, response) {
                            // nav back to build page
                            App.router.navigate("build?" + App.defaultOrg, { trigger: true });
                        }
                    });
                }
                
            },

            newQuestion_ONCLICK: function(){

                var self = this;
                $("#newQuestionPopup").popup("open");
                $("#addNewQuestion").on("click", { self: self }, this.addNewQuestion_ONCLICK);

            },

            filePublish_ONCLICK: function () {
                
                // to update and publish this file simply update the updated_at field for the file
                var model = App.fileCollection.get(App.fileId);
                
                model.save({
                    "updated_at": new Date()
                },
                {
                    success: function (model, response) {
                        console.log(model);
                        App.lastPublished = model.get("updated_at");
                        if (App.lastPublished == "null") {
                            $("#lastPublished").html("Last Published: never");
                        }
                        else {
                            $("#lastPublished").html("Last Published: " + App.lastPublished);
                        }

                        // re-load data from server for the client, file, questions, options
                        App.uFileCollection.storage.sync.full({ url: App.utils.urlify("Files/" + App.defaultOrg) });
                        App.uQuestionCollection.storage.sync.full({ url: App.utils.urlify("UQuestionCollection/" + App.defaultOrg) });
                        App.uOptionCollection.storage.sync.full({ url: App.utils.urlify("OptionCollection/" + App.defaultOrg) });
                        
                        alert("Survey successfully published.");

                        // renav to build page 
                        App.router.navigate("#build?" + App.defaultOrg, { trigger: true });

                        $("#questionList").html("");

                    },
                    wait: true
                });

            },

            addNewQuestion_ONCLICK: function (e) {

                $("#addNewQuestion").off("click");

                var q = $("#newQuestionType").val();

                // add question to the file
                // POST /api/question   {type: questionType}
                if (q == "Gps" || q == "Camera" || q == "Signature" || q == "OpenEnded" || q == "SingleAnswer" || q == "MultipleChoice") {
                   
                    App.questionCollection.create({
                        fileId: App.fileId,
                        type: q,
                        order: 0
                    },{

                        wait: true,

                        success: function (data, textStatus, jqXHR) {
                            // nav to #question/qid page
                            App.router.navigate("question?" + data.id, { trigger: true });

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert("Error - " + textStatus.statusText);
                        }

                    });

                }

                $("#newQuestionPopup").popup("close");
                
            }

        });

        return FileCompositeView;

    });
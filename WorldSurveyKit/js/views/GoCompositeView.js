// Go Composite  View
// ==================

///
///  this view passes the model to the particular question view type GPS, Open Ended etc...
///
define(["jquery", "backbone", "models/Models", "views/GoOpenEndedView", "views/GoGpsView", "views/GoOptionsView", "views/GoSignatureView"],
    function ($, Backbone, Models, GoOpenEndedView, GoGpsView, GoOptionsView, GoSignatureView) {

    var GoCompositeView = Backbone.View.extend({

        el: "#go .main-content",

        fileId: "",

        questionId: "",

        fileInstanceId: "",

        fileInstColl: null,

        responseColl: null,

        edit: "",

        events: {
           
        },

        // The View Constructor
        initialize: function() {

            console.log("====> GoCompositeView - init()");

        },

        // renders the question content
        render: function () {
            
            console.log("====> GoCompositeView - render()");
            
            var self = this;

            // fetch local to update any out of sync id's
            App.localFileLoad();


            ///
            /// get the data from the collection
            ///

            // get the Question model
            var model = App.uQuestionCollection.where({ sid: parseInt(App.goCompositeView.questionId) });
            model = model[0];
            var type = model.get("type");

            // get the fileId
            this.fileId = parseInt(model.get("fileId"));

            // get file name
            var fileName = App.uFileCollection.where({ sid: this.fileId });
            fileName = fileName[0].get("fileName");
            var fileInstanceName;
            // get file instance name, this can be referenced by sid of id
            if (App.isClientId(this.fileInstanceId)) { // client id
                fileInstanceName = self.fileInstColl.where({ id: this.fileInstanceId });
            }
            else { // server id
                fileInstanceName = self.fileInstColl.where({ sid: parseInt(this.fileInstanceId) });
            }

            fileInstanceName = fileInstanceName[0].get("name");

            // get the number of questions in the file
            var questionCount = App.uQuestionCollection.where({ fileId: this.fileId }).length;

            // get the next question id and back one question id
            var next = App.uQuestionCollection.where({ order: (parseInt(model.get("order"))) + 1, fileId: this.fileId });
            var back = App.uQuestionCollection.where({ order: (parseInt(model.get("order"))) - 1, fileId: this.fileId });
            try { next = next[0].get("sid"); } catch (e) { next = null; }
            try { back = back[0].get("sid"); } catch (e) { back = null; }

            // set the data we collected in the model to pass into the sub-views
            model.set({ back: back, next: next, fileInstanceId: App.goCompositeView.fileInstanceId, fileName: fileName, fileInstanceName: fileInstanceName });
            console.log("QuestionSkeletal Model V");
            console.log(model);

            // render the side panel
            App.goCompositeView.renderPanel();

         
                // choose the view
                if (type == "SingleAnswer" || type == "MultipleChoice") {

                    // new QOptionAnswerView
                    if (!App.goOptionsView) {
                        App.goOptionsView = new GoOptionsView();
                        App.goOptionsView.fileInstColl = self.fileInstColl;
                        App.goOptionsView.responseColl = self.responseColl;
                        App.goOptionsView.edit = self.edit;
                        App.goOptionsView.render(model, questionCount);
                    }
                    // existing QOptionAnswerView
                    else {
                        App.goOptionsView.fileInstColl = self.fileInstColl;
                        App.goOptionsView.responseColl = self.responseColl;
                        App.goOptionsView.edit = self.edit;
                        App.goOptionsView.render(model, questionCount);
                    }

                }
                else if (type == "OpenEnded") {

                    // new GoOpenEndedView
                    if (!App.goOpenEndedView) {
                        App.goOpenEndedView = new GoOpenEndedView();
                        App.goOpenEndedView.fileInstColl = self.fileInstColl;
                        App.goOpenEndedView.responseColl = self.responseColl;
                        App.goOpenEndedView.edit = self.edit;
                        App.goOpenEndedView.render(model, questionCount);
                    }
                    // existing GoOpenEndedView
                    else {
                        App.goOpenEndedView.fileInstColl = self.fileInstColl;
                        App.goOpenEndedView.responseColl = self.responseColl;
                        App.goOpenEndedView.edit = self.edit;
                        App.goOpenEndedView.render(model, questionCount);
                    }

                }
                else if (type == "Gps") {

                    // new GoGpsView
                    if (!App.goGpsView) {
                        App.goGpsView = new GoGpsView();
                        App.goGpsView.fileInstColl = self.fileInstColl;
                        App.goGpsView.responseColl = self.responseColl;
                        App.goGpsView.edit = self.edit;
                        App.goGpsView.render(model, questionCount);
                    }
                    // existing GoGpsView
                    else {
                        App.goGpsView.fileInstColl = self.fileInstColl;
                        App.goGpsView.responseColl = self.responseColl;
                        App.goGpsView.edit = self.edit;
                        App.goGpsView.render(model, questionCount);
                    }
                }
                else if (type == "Camera") {

                    // new CameraView
                    if (!App.goCameraView) {
                        App.goCameraView = new GoCameraView();
                        App.goCameraView.fileInstColl = self.fileInstColl;
                        App.goCameraView.responseColl = self.responseColl;
                        App.goCameraView.edit = self.edit;
                        App.goCameraView.render(model, questionCount);
                    }
                        // existing QGpsView
                    else {
                        App.goCameraView.fileInstColl = self.fileInstColl;
                        App.goCameraView.responseColl = self.responseColl;
                        App.goCameraView.edit = self.edit;
                        App.goCameraView.render(model, questionCount);
                    }

                }
                else if (type == "Signature") {

                    // new QSignatureView
                    if (!App.goSignatureView) {
                        App.goSignatureView = new GoSignatureView();
                        App.goSignatureView.fileInstColl = self.fileInstColl;
                        App.goSignatureView.responseColl = self.responseColl;
                        App.goSignatureView.edit = self.edit;
                        App.goSignatureView.render(model, questionCount);
                    }
                        // existing QGpsView
                    else {
                        App.goSignatureView.fileInstColl = self.fileInstColl;
                        App.goSignatureView.responseColl = self.responseColl;
                        App.goSignatureView.edit = self.edit;
                        App.goSignatureView.render(model, questionCount);
                    }

                }
            
               
        },

        // renders the slider panel
        renderPanel: function () {

            var self = this;

            var fileId = App.goCompositeView.fileId;
            var questionId = App.goCompositeView.questionId;
            var fileInstanceId = App.goCompositeView.fileInstanceId;


            // show the side panel
            $(".panelGo").html("");
            $(".panelGo").append(
                '<li><a href="#home" >Home</a></li>' +
                '<li data-icon="off"><a class="logoutBtn">Logoff</a></li>' +
                '<li data-icon="cog"><a href="#settings">Settings</a></li>' +
                '<li data-theme="b">Questions</li>'
            );


            _.each(App.uQuestionCollection.where({ fileId: fileId }), function (model) {

                //console.log(model.get("sid"));

                if ( parseInt(questionId) != parseInt(model.get("sid")) ) {
                    $(".panelGo").append(
                        '<li><a onclick="$(\'#panelGo\').panel(\'close\')" href="#go?file' +
                        fileInstanceId + '?q' + model.get("sid") + self.edit + '">' + model.get("order") + ').' + model.get("question") + '</a></li>'
                     );
                }
                else {
                    $(".panelGo").append(  
                        '<li data-theme="d" data-icon="false"><a onclick="$(\'#panelGo\').panel(\'close\')" href="#go?file' +
                         fileInstanceId + '?q' + model.get("sid") + self.edit + '">' + model.get("order") + ').' + model.get("question") + '</a></li>'
                    );
                }

                $(".panelGo").listview("refresh");
                
            });

            // make a delete survey button

            $(".panelGo").append(
               '<li data-icon="trash"><a class="delete-survey">Delete Survey</a></li>'
            );

            $(".panelGo").listview("refresh");

            // wire up delete button
            $(".delete-survey").off("click");
            $(".delete-survey").on("click", { self: this }, this.deleteSurvey_ONCLICK );
            
           
        },

        deleteSurvey_ONCLICK: function (e) {



            var self = e.data.self;

            var fileInstanceId = App.goCompositeView.fileInstanceId;

            // alert("deleting survey: " + fileInstanceId);
            var model;
            
            var answer = confirm("Are you sure you want to delete this survey?");
            if (answer) {
                // offline delete
                if (App.isClientId(fileInstanceId)) {
                    model = self.fileInstColl.where({ id: fileInstanceId });
                }
                    // online delete
                else {
                    model = self.fileInstColl.where({ sid: parseInt(fileInstanceId) });
                }

                model[0].destroy({
                    success: function (model, response) {
                        try {
                            self.fileInstColl.storage.sync.push();
                        }
                        catch (e) { }
                        App.router.navigate("home", { trigger: true });
                    }
                });
            }


        }


    });

    return GoCompositeView;

});
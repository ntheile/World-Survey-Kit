// Home Composite  View
// ==========================

define(["jquery", "backbone", "models/Models"],
    function ($, Backbone, Models) {

    // Extends Backbone.View
    var HomeCompositeView = Backbone.View.extend({

        el: "#home .main-content",

        events: {
            "click #homeNewSurvey": "newSurvey_ONCLICK"
        },

        initialize: function() {

            console.log("====> HomeCompositeView - init()");


        },

        render: function () {
            
            var self = this;
            
            console.log("====> HomeCompositeView - render()");

            $("#homeHeading").html(App.defaultOrgName);

            $.when(App.uFileInstanceCollection.deferred).done(function () {
                $(".homeSurveyHistory").html(self.surveyCount());
            });


            $("#homeListView").css("visibility", "visible");
            $.mobile.loading("hide");


            // get feed
            var url = App.utils.urlify("feed/" + App.defaultOrg);
            $.ajax(url, {
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    $("#activityFeed").html("");
                    $("#activityFeed").append("<h3>Activity Feed</h3>");

                    _.each(data, function (item) {
                        var fid = item.fid;
                        var feed = item.feed;
                        var pic = "//graph.facebook.com/" + fid + "/picture?type=square";
                        var name = "";
                        var date = item.date;
                                  
                       
                        FB.api('/' + fid, function (r) {

                            name = r.name;
                            $("#activityFeed").append("<br/><div style='float:left'><img src=" + pic + " /></div><div style='float:left'>&nbsp;&nbsp;&nbsp;&nbsp</div><div style='float:left'><b>" + name + "</b>&nbsp;&nbsp;<small>" + date + "</small><br/>" + feed + "</div><hr style='clear:both' />");
                        });
                       
                        

                    });
                },
                error: function (model, response) {
                    $.mobile.loading("hide");
                    alert(response.statusText);
                }

            });

            
            return this;

        },

        newSurvey_ONCLICK: function (e) {

            $("#homeNewSurveyPopup").popup("open");

            // populate list with files
            $("#homeNewSurveyList").html('<ul data-role="listview" id="homeNewSurveyListView" data-inset="true" data-theme="b"></ul> ');
            $("#homeNewSurveyList").trigger("create");
   
            var self = this;

            //// filter out unpublished surveys, aka where updated_at is null
            _.each(App.uFileCollection.filter(function (item) { return item.get("updated_at") !== null; }),  function (model) {
                var fileName = model.get("fileName");
                var sid = model.get("sid"); // server id
                var id = model.get("id"); // if bb offline is slow then the id is still the server id

                // on first load sid may be undefined because backbone.offline is still processessing, so simply use the id, maybe we should force backbone.offline to load?
                if (sid == undefined) {
                    sid = id;
                }

                console.log("filename: " + fileName);
                console.log("sid: " + sid);
                console.log("id: " + id);

                $("#homeNewSurveyListView").append('<li>' +
                    '<a class="homeNewSurveyCreate" data-val="' + sid + '" >' + fileName + '</a>' +
                '</li>');

                $("#homeNewSurveyListView").listview("refresh");

            });

         


            $('.homeNewSurveyCreate').off('click');
            $('.homeNewSurveyCreate').on('click', { self: self }, self.homeNewSurveyCreate_ONCLICK);

        },

        homeNewSurveyCreate_ONCLICK: function (e) {

            
            var surveyName = $("#homeNewSurveyName").val();
            var fileId = $(this).attr("data-val");
            
            console.log("FileSid = " + fileId);
            

            if (!surveyName){
                alert("You must enter a name");
            }
            else {

                $("#homeNewSurveyPopup").popup("close");

                //create the new NewFileInstance, do a local save, then nav to the first question
                App.uFileInstanceCollection.create({
                    fileId: fileId,
                    name: surveyName
                }, {

                    success: function (data, textStatus, jqXHR) {

                        App.router.navigate("#go?file" + data.id, { trigger: true });

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert("Error - " + textStatus.statusText);
                    }

                });

                $.mobile.loading("hide");
            }

            
        },

        // count of surveys in history 
        surveyCount: function() {

            // bubble count of surveys
            var bubbleCount = 0;

            _.each(App.uFileInstanceCollection.models, function (model) {

                var fileId = model.get("fileId");

                try {

                    var filesOrgId = App.uFileCollection.where({ sid: parseInt(fileId) })[0].get("orgsId");

                    if (filesOrgId == App.defaultOrg) {
                        bubbleCount++;
                    }
                }
                catch (e) {

                }
            });

            return bubbleCount;

        }


    });

    return HomeCompositeView;

});
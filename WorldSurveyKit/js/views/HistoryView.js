// History  View
// =============================

define(["jquery", "backbone", "models/Models"], function ($, Backbone, Models) {

        var HistoryView = Backbone.View.extend({

            el: "#history .main-content",

            events: {
                "change #page-select": "page_ONCHANGE"
            },

            // The View Constructor
            initialize: function () {

                console.log("====> History View - init()");

            },

            pageSize: 20,

            render: function (page) {

                console.log("====> History View - render()");

                $("#historyList").html("");

                // if there is over 25 items in the collections then pageinate 
                var pSize = this.pageSize;
                var startItem = (page * pSize);
                var endItem = startItem + pSize;
                var myFilesArray = [];

                _.each(App.uFileInstanceCollection.models, function (model) {

                    var fileId = model.get("fileId");

                    try {

                        var file = App.uFileCollection.where({ sid: parseInt(fileId, 10) });
                        var filesOrgId = file[0].get("orgsId");
                        model.fileName = file[0].get("fileName");

                        // is the file instance in our default Org?
                        console.log(filesOrgId);
                        if (filesOrgId == App.defaultOrg) {
                            myFilesArray.push(model);
                        }                        
                    }
                    catch (e) {
                        // not in our current org
                    }

                });


                // loop your files and create the li's
                _.each(myFilesArray.slice(startItem, endItem), function (model) {
                    // is fileInstance dirty ?
                    if (App.isDirty(model)) {
                        $("#historyList").append(
                            "<li data-icon='pencil' ><a data-iconpos='left' href='#go?file" + model.get("id") + "'>" + model.get("name") + " - " + model.fileName + "</a></li>"
                        );
                    }
                    else {
                        $("#historyList").append(
                            "<li data-icon='pencil' ><a data-iconpos='left' href='#go?file" + model.get("sid") + "'>" + model.get("name") + " - " + model.fileName + "</a></li>"
                        );
                    }

                    $("#historyList").listview("refresh");
                });


                // modify paging buttons
                console.log("li count:   " + myFilesArray.length + "  |  start: " + startItem + "    |  end  " + endItem);
                var collectionLength = myFilesArray.length;
                if (myFilesArray.length >= 20) {
                    $("#historyPaging").css("visibility", "visible");
                    $("#page-back").show();
                    $("#page-next").show();

                    // create paging button
                    var numPages = Math.ceil((collectionLength / pSize));
                    $("#page-select").html('');
                    for (var i = 1; i <= numPages; i++) {
                        $("#page-select").append('<option value="'+ (i - 1) +'">Page '+ i +'</option>');
                    }

                    // set the next and back page href
                    $("#page-back").attr("href", "#history?" + (page - 1));
                    $("#page-next").attr("href", "#history?" + (page + 1));
                    $("#page-select").val(page);
                    $("#page-select").selectmenu("refresh");

                    // hide back button on page 1
                    if (page == 0) {
                        $("#page-back").hide();
                    }

                    // hide next button on last page
                    if ((page + 1) == numPages) {
                        $("#page-next").hide();
                    }
                }
                else {
                    if (page == 0) {
                        $("#historyPaging").css("visibility", "hidden");
                    }
                }

                $("#history").trigger("create");

            },

            page_ONCHANGE: function (e) {
                App.router.navigate("#history?" + e.currentTarget.value, { trigger: true });
            }

        });

        return HistoryView;

    });
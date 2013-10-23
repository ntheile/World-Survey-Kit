// Report Table View 
// ====================

// 8-12-2012 : change this to use only live server data - if you do an edit on a field ?edit call to update local 
// ?edit

define(["jquery", "backbone", "models/Models", "text!templates/ReportTableTemplate.html", "sig", "libs/json2.min", "libs/flashcanvas", "libs/jquery.table2csv"],
    function ($, Backbone, Models, ReportTableTemplate, signaturePad) {

    var ReportTableView = Backbone.View.extend({

        el: "#reportsTable",

        template: _.template(ReportTableTemplate),

        events: {
            
        },

        initialize: function() {

  
            // helper function to POST data back for a CSV download from the server
            jQuery.download = function (url, data, method) {
                //url and data options required
                if (url && data) {
                    //data can be string of parameters or array/object
                    data = typeof data == 'string' ? data : jQuery.param(data);
                    //split params into form inputs
                    var inputs = '';
                    jQuery.each(data.split('&'), function () {
                        var pair = this.split('=');
                        inputs += '<input type="hidden" name="' + pair[0] + '" value="' + pair[1] + '" />';
                    });
                    //send request
                    jQuery('<form data-ajax="false" action="' + url + '" method="' + (method || 'post') + '">' + inputs + '</form>')
                    .appendTo('body').submit().remove();
                }
            };
          
        },

        render: function (fileId) {
            
            var self = this;

            console.log("====> ReportTableView - render()");

            var file = App.uFileCollection.where({ sid: parseInt(fileId) });

            $("#reportsTable").html(this.template({ fileName: file[0].get("fileName"), id: file[0].get("sid") }));

            this.renderTable(fileId);

        },

        // render the table
        renderTable: function (fileId) {

            var self = this;

            $("#reportTableHeader").html("");
            $("#reportTableFooter").html("");
            $("#reportTableBody").html("");
            
            // render header and footer
            var headFootHtml = "<th>Edit</th>" +
                               "<th>Id</th>" +
                               "<th>Survey Name</th>" +
                               "<th>User</th>" +
                                "<th>User ID</th>" +
                               "<th>Date</th>";
            $("#reportTableHeader").append(headFootHtml);
            $("#reportTableFooter").append(headFootHtml);
            _.each(App.uQuestionCollection.where({ fileId: parseInt(fileId) }), function (model) {
                var html = "<th>" + model.get("order") + "). " + model.get("question") + "</th>";
                //console.log("html");
                //console.log(html);
                $("#reportTableHeader").append(html);
                $("#reportTableFooter").append(html);
            });


            var fileInstId;
            var userName;
            var fbId;
            var userObj;

            // render body
            // loop each fileInstance then loop each questions to see if it
            // has a reponsee, if not, it's blank
            _.each(App.fileInstanceCollection.where({ fileId: parseInt(fileId) }), function (fileInstModel) {

                fileInstId = fileInstModel.get("id");
                userObj = fileInstModel.get("User");

                // ?edit
                //// if its your file then go to normal go router
                //if (App.uFileInstanceCollection.where({ sid: parseInt(fileInstId) }).length > 0) {
                //    $("#reportTableBody").append(
                //        "<tr id='reportRow" + fileInstId + "'>" +
                //            "<td><a class='editTableRow' data-file='" + fileInstId + "' data-role='button' data-theme='b' data-mini='true' data-corners='false' data-inline='true' href='#go?file" + fileInstId + "'>Edit</a></td>" +
                //            "<td>" + fileInstModel.get("id") + "</td>" +
                //            "<td>" + fileInstModel.get("name") + "</td>" +
                //            "<td>" + userObj.name + "</td>" +
                //            "<td>" + userObj.fbUserId + "</td>" +
                //            "<td>" + fileInstModel.get("updated_at") + "</td>" +
                //        "</tr>"
                //    );

                //}
                //// if it's somebody elses file then append ?edit to the end of the route
                //else {
                    $("#reportTableBody").append(
                        "<tr id='reportRow" + fileInstId + "'>" +
                            "<td><a class='editTableRow' data-file='" + fileInstId + "' data-role='button' data-theme='b' data-mini='true' data-corners='false' data-inline='true' href='#go?file" + fileInstId + "?q-200?edit'>Edit</a></td>" +
                            "<td>" + fileInstModel.get("id") + "</td>" +
                            "<td>" + fileInstModel.get("name") + "</td>" +
                            "<td>" + userObj.name + "</td>" +
                             "<td>" + userObj.fbUserId + "</td>" +
                            "<td>" + fileInstModel.get("updated_at") + "</td>" +
                        "</tr>"
                    );
                //}


                _.each(App.uQuestionCollection.where({ fileId: parseInt(fileId) }), function (questionModel) {
                    var qId = questionModel.get("sid");
                    var type = questionModel.get("type");
                    var responseModelCollection = App.responseCollection.where({ newFileInstanceId: parseInt(fileInstId), questionsId: qId  });                                                                        
                    var col = "#reportRow" + fileInstId;

                    self.renderColumn(responseModelCollection, type, col, fileInstId);
                });
                 
                   
            });

            // grab the raw html table for the csv export
            $("#csvExportTable").html($('#reportTableTag').html());
            $("#csvExportTable").hide();

            // Markup the Table
            $('#reportTableTag').dataTable();
            $("#reports").trigger("create");
            $(".dataTables_filter").after("<div style='clear:both'></div>");


            // bind to window resize events for desktop view and table
            if ($(window).width() > 680) {
                var height = $(window).height();
                var k = 300;
                $('.table-wrapping').height(height - k);
            }
            $(window).bind("resize", function () {
                if ($(window).width() > 680) {
                    var height = $(window).height();
                    var k = 300;
                    $('.table-wrapping').height(height - k);
                }
            }).trigger("resize");

            
            // bind to edit click 
            $(".editTableRow").off("click");
            $(".editTableRow").on("click", this, this.editTableRow_ONCLICK );


        },

        // Renders a table column, returns a td
        renderColumn: function (responseModelCollection, type, colEl, fileInstId) {

            //console.log("====render row======");
            //console.log(responseModelCollection);
            //console.log(type);
            var td;
            var jsonObj;
            var signature;
            var responseId;

            // response exists
            if (responseModelCollection.length > 0) {
                try {
                    // render by type
                    if (type == "SingleAnswer" || type == "MultipleChoice") {
                        var items = "";
                   
                        // TODO fix last comma
                        _.each(responseModelCollection, function (model) {
                            var optionsId = model.get("response");
                            var response = App.uOptionCollection.where({ sid: parseInt(optionsId) });
                            items = items + response[0].get("option") + ", ";
                        });
                        td = "<td>" + items + "</td>";
                    }
                    else if (type == "OpenEnded") {
                        td = "<td>" + responseModelCollection[0].get("response") + "</td>";
                    }
                    else if (type == "Gps") {
                        jsonObj = $.parseJSON(responseModelCollection[0].get("response"));
                        td = "<td>" +
                                "Latitude: " + jsonObj.latitude + 
                                ", Longitude: " + jsonObj.longitude +
                                ", Description: " + jsonObj.desc +
                            "</td>";
                    }
                    else if (type == "Camera") {
                    }
                    else if (type == "Signature") {
                        jsonObj = $.parseJSON(responseModelCollection[0].get("response"));
                        responseId = responseModelCollection[0].get("id");
                        var printed = jsonObj.printed;
                        signature = jsonObj.signature;
                        td = '<td>' +
                                printed +
                                 ' <div id="sig' + responseId + '" class="sig sigWrapper" style="height:90px; z-index:4">' +
                                    '<canvas class="pad" width="580" height="90"></canvas>' +
                                    '<input type="hidden" name="output" class="output">' +
                                '</div>' +
                             '</td>';
                    }
                }
                catch (e) {
                    td = "<td></td>";
                }
            }
            // blank
            else {
                //console.log("renderRow");
                //console.log("blank");
                td = "<td></td>";
            }


            // append the column to the table
            $(colEl).append(td);


            // re-render the signature view
            if (type == "Signature") {
                try{
                    $('#sig' + responseId).signaturePad({
                        displayOnly: true,
                        lineTop: 75
                    }).regenerate(signature);
                }
                catch (e) { }
            }

        },

        editTableRow_ONCLICK: function (e) {

            var href = $(this).attr("href");
            var fileInst = $(this).attr("data-file");

            App.responseCollection.refetch = true;

            // check if the file inst exists in the collection
            if (App.uFileInstanceCollection.where({ sid: parseInt(fileInst) }).length > 0) {

            }
            // if not then fetch it from the server
            else {
                e.preventDefault();
                App.router.navigate(href, { trigger: true, replace: true });
            }


        }


    });

    return ReportTableView;

});
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace WorldSurveyKit
{
    public partial class CsvExporter : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {



            Response.Clear();
            Response.ContentType = "application/octet-stream";
            Response.AddHeader("Content-Disposition", "attachment;filename=SurveyExport.csv");

            Response.Charset = "";
            Response.Cache.SetCacheability(HttpCacheability.NoCache);

            string[] c = Request.Form.GetValues("content");
            string csv = Server.UrlDecode(c[0]);
            Response.Write(csv.ToString());
            Response.End();

        }


    }
}
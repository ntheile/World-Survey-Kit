using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

// routes for cshtml [not used in this project]
namespace WorldSurveyKit
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}"//,
                //defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional } // comment this line out if you want index.html to be the default route
            );

        }
    }
}
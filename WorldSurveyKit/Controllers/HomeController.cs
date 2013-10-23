using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WorldSurveyKit.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {

            ViewBag.a = "item";

            return View();

        }

    }
}

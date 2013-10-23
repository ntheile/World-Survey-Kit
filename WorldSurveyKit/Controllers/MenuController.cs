using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using WorldSurveyKit.Models;

namespace WorldSurveyKit.Controllers
{
    public class MenuController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        // GET api/Menu
        public IEnumerable<Menu> GetMenus()
        {
            return db.Menus.AsEnumerable();
        }

        // GET api/Menu/5
        [HttpGet]
        public IEnumerable<Menu> GetMenu(string id)
        {

            string uid = id.ToString();
            var menu = db.Menus.Where(r => r.userId == uid);
            return menu.AsEnumerable();

        }

        // PUT api/Menu/5
        public HttpResponseMessage PutMenu(int id, Menu menu)
        {
            if (ModelState.IsValid && id == menu.id)
            {
                db.Entry(menu).State = EntityState.Modified;

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // POST api/Menu
        public HttpResponseMessage PostMenu(Menu menu)
        {
            if (ModelState.IsValid)
            {
                db.Menus.Add(menu);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, menu);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = menu.id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/Menu/5
        public HttpResponseMessage DeleteMenu(int id)
        {
            Menu menu = db.Menus.Find(id);
            if (menu == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Menus.Remove(menu);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, menu);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
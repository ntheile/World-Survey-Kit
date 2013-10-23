using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WorldSurveyKit.App_Start;
using WorldSurveyKit.Models;
using Newtonsoft.Json.Linq;


namespace WorldSurveyKit.Controllers
{
    [Auth.FB]
    public class ImporterController : ApiController
    {

        private MyDatabase db = new MyDatabase();

        /// <summary>
        /// Imports data in bulk, creates a new file instance and creates responses for that instance
        /// <param name="jJson">
        ///  { 
        ///     file: fileId,
        ///     fileName: name,
        ///     questionsIdMap: ["34","35","36","37"] 
        ///     responses: [
        ///        { 0: "q1a", 1: "q2a" },  // in this case 0 maps to questionId 34
        ///        { 0: "q2a", 1: "q22a" },
        ///        { 0: "q3a", 1: "q23a" },
        ///        { 0: "q4a", 1: "q24a" }
        ///     ]
        /// 
        ///  }
        /// </param>
        /// <returns>
        ///     json response with message array of inserted data
        ///     {"message":["Created file : labowski 0, id: 115","Added response to : labowski 1 , response: bowling , id: 256"]}    
        /// </returns>
        /// </summary>
        // POST api/importer
        public JObject Post(JObject jJson)
        {
            // make sure user is an org admin of at least one org
            // TODO this needs to be hardened by passing in the org and checking if user is orgadmin 
            // also make sure all files passed in belong to org
            // also make sure each question belongs to the org
            if (Auth.FB.IsOrgAdmin())
            {
                // dynamic input from inbound JSON
                dynamic json = jJson;

                // output json message to user
                JObject jsonOutput = new JObject();
                dynamic jOutput = jsonOutput;
                jOutput.message = new JArray() as dynamic;

                // file
                int file = int.Parse(json.file.Value);

                // file
                string fileName = json.fileName.Value;

                // questionID Array
                dynamic questionIdArray = new JArray(json.questionsIdMap);

                // responses onject
                dynamic responses = new JArray(json.responses);

                // loop responses and gather data to create a new file instance, add to the fileInstanceCreator object
                List<FileInstanceCreator> fileInstanceCreator = new List<FileInstanceCreator>(); // holds all of the file instances and responses we need to create
                int x = 1; // placeholder for a new instance
                foreach (dynamic row in json.responses)
                {
                    // loop the responses in the row and build a query
                    FileInstanceCreator fi = new FileInstanceCreator();
                    fi.id = x;
                    foreach (dynamic resp in row)
                    {
                        if (resp.Value.Value != "")
                        {
                            fi.responseArray.Add(new response { qid = int.Parse(questionIdArray[int.Parse(resp.Name)].Value), resp = resp.Value.Value });
                        }
                    }
                    x++;
                    fileInstanceCreator.Add(fi);
                }

                var rowNum = 1;
                // loop file instances and create a new file instance if the responseArray is not empty
                foreach (FileInstanceCreator fileInst in fileInstanceCreator)
                {
                    if (fileInst.responseArray.Count > 0)
                    {
                        // create new file instance 
                        NewFileInstance newInst = new NewFileInstance
                        {
                            name = fileName + " " + fileInst.id,
                            userId = Auth.FB.GetUserId(),
                            fileId = file,
                            created_at = DateTime.Now.ToString("O")
                        };

                        db.NewFileInstance.Add(newInst);
                        db.SaveChanges();


                        // write each successful insert to log and pass back to user
                        jOutput.message.Add("<b>" + rowNum + ".) Created file : " + newInst.name + ", id: " + newInst.id.ToString() + "</b>");


                        // loop the response array, lookup question type and insert responses for the file instance and question id
                        foreach (response question in fileInst.responseArray)
                        {
                            try
                            {
                                string type = db.Questions.Find(question.qid).type;
                                Responses r = new Responses();

                                bool valid = false;
                                if (type == "Signature")
                                {
                                    // do nothing, we dont import signatures at this point
                                    valid = false;
                                }
                                else if (type == "MultipleChoice")
                                {
                                    // then split each option by ,, and lookup id and do mutiple inserts into the respose table if needed
                                    valid = true;
                                    string[] stringSeparators = new string[] { ",," };
                                    string[] multChoiceAry;
                                    multChoiceAry = question.resp.Split(stringSeparators, StringSplitOptions.None);
                                    foreach (string sResp in multChoiceAry)
                                    {
                                        //then lookup id     
                                        int optionId = db.Options.FirstOrDefault(o => o.questionsId == question.qid && o.option == sResp).id;
                                        r.response = optionId.ToString();

                                        r.response = optionId.ToString();
                                        r.respondedTo = true;
                                        r.created_at = DateTime.Now.ToString("O");
                                        r.updated_at = DateTime.Now.ToString("O");
                                        r.newFileInstanceId = newInst.id;
                                        r.questionsId = question.qid;

                                        db.Responses.Add(r);
                                        db.SaveChanges();
                                        // write each insert to log to pass back to user
                                        jOutput.message.Add("Added response to : " + newInst.name + " , response: " + sResp + "[" + optionId + "] , id: " + r.id + "<hr/>");
                                    }
                                }
                                else if (type == "SingleAnswer")
                                {
                                    //then lookup id     
                                    valid = true;
                                    int optionId = db.Options.FirstOrDefault(o => o.questionsId == question.qid && o.option == question.resp).id;
                                    r.response = optionId.ToString();
                                }
                                else if (type == "Gps")
                                {
                                    //then insert 
                                    valid = true;
                                    r.response = question.resp;
                                }
                                else
                                {
                                    // type is open ended then insert
                                    valid = true;
                                    r.response = question.resp;
                                }


                                if (valid == true && type != "MultipleChoice")
                                {
                                    r.respondedTo = true;
                                    r.created_at = DateTime.Now.ToString("O");
                                    r.updated_at = DateTime.Now.ToString("O");
                                    r.newFileInstanceId = newInst.id;
                                    r.questionsId = question.qid;

                                    db.Responses.Add(r);
                                    db.SaveChanges();

                                    // write each insert to log to pass back to user
                                    jOutput.message.Add("Added response to : " + newInst.name + " , response: " + question.resp + " , id: " + r.id + "<hr/>");
                                }
                                else if (valid == false)
                                {
                                    // write each insert to log to pass back to user
                                    jOutput.message.Add("<b style='color:red'>Failed attempting to add response for question with an ID of : " + question.qid + " , your invalid response was <i> " + question.resp + " </i>. Please check your formatting and edit the response in the report view.</b><hr/> ");
                                }
                                else { }
                            }
                            catch (Exception e)
                            {
                                jOutput.message.Add("<b style='color:red'>Failed attempting to add response for question with an ID of : " + question.qid + " , row " + rowNum + " , your invalid response was <i> " + question.resp + " </i>. Please check your formatting and edit the response in the report view.</b><hr/> ");
                            }


                        }

                    }

                    rowNum++;

                }

                return jOutput;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }


        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

    }


    // Class Skeleton that holds all of the file instances and responses we need to create
    public class FileInstanceCreator
    {
        public int id { get; set; }
        public List<response> responseArray { get; set; }

        public FileInstanceCreator()
        {
            responseArray = new List<response>();
        }

    }
    public class response
    {
        public int qid { get; set; }
        public string resp { get; set; }
    }

}

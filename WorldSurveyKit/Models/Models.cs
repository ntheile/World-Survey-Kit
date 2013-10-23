using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace WorldSurveyKit.Models
{

    #region Helper Methods
    /// <summary>
    /// Methods to remove HTML from strings. Prevents xss attacks
    /// </summary>
    public static class HtmlRemoval
    {
        /// <summary>
        /// Remove HTML from string with Regex.
        /// </summary>
        public static string Strip(string source)
        {
            try
            {
                return Regex.Replace(source, "<.*?>", string.Empty);
            }
            catch (Exception e)
            {
                return "";
            }

        }
    }

    /// <summary>
    /// Menu model
    /// </summary>
    public class Menu
    {
        public int id { get; set; }
        public string text { get; set; }
        public string url { get; set; }
        public string active { get; set; }
        public string created_at { get; set; }
        public string updated_at { get; set; }
        public string userId { get; set; }
        public string dummy { get; set; }

    }
    #endregion

    #region Organization Domain Models

    /// <summary>
    /// Organization table
    /// </summary>
    [Table("Orgs")]
    public class Orgs
    {
        [Key]
        public int id { get; set; }

        private string _orgName;
        public string orgName
        {
            get
            {
                return _orgName;
            }
            set
            {
                _orgName = HtmlRemoval.Strip(value);
            }
        }

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

    }

    /// <summary>
    /// User to Organization mapping
    /// </summary>
    [Table("OrgUserMappings")]
    public class OrgUserMappings
    {
        [Key]
        public int id { get; set; }

        public bool isOrgAdmin { get; set; }

        public int orgsId { get; set; } // fk OrgId 
        public Orgs Orgs { get; set; } // fk helper

        public int usersId { get; set; } // fk UsersId
        public Users Users { get; set; } // fk helper

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

    }
    #endregion

    #region User Domain Models

    /// <summary>
    /// User Model 
    /// </summary>
    public class Users
    {
        [Key]
        public int id { get; set; }

        private string _fbUserId;
        [Required(ErrorMessage = "Facebook ID required")]
        public string fbUserId
        {
            get
            {
                return _fbUserId;
            }
            set
            {
                _fbUserId = HtmlRemoval.Strip(value);
            }
        }

        private string _name;
        [Required(ErrorMessage = "Name required")]
        public string name
        {
            get
            {
                return _name;
            }
            set
            {
                _name = HtmlRemoval.Strip(value);
            }
        }

        public bool isSystemAdmin { get; set; }

        public int defaultOrg { get; set; }

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

    }

    #endregion

    #region  File/Survey Domain Models

    /// <summary>
    /// File Model (survey and file are used interchangably)
    /// </summary>
    [Table("File")]
    public class File
    {
        [Key]
        public int id { get; set; }

        private string _fileName;
        public string fileName
        {
            get
            {
                return _fileName;
            }
            set
            {
                _fileName = HtmlRemoval.Strip(value);
            }
        }

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

        public int orgsId { get; set; } // fk OrgsId // if you are a member of the org than you can view the file, it's that simple, you are either an admin who can create and use surveys or you are a user who can take a survey
        public Orgs Orgs { get; set; } //fk helper


    }


    /// <summary>
    /// New File Instance Table (intstance of a file/survey)
    /// </summary>
    [Table("NewFileInstance")]
    public class NewFileInstance
    {
        [Key]
        public int id { get; set; }

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

        private string _name;
        public string name
        {
            get
            {
                return _name;
            }
            set
            {
                _name = HtmlRemoval.Strip(value);
            }
        }

        public bool completed { get; set; }

        public int userId { get; set; } // fk UserId
        public Users User { get; set; } // fk helper

        public int fileId { get; set; } // fk FileId
        public File File { get; set; }  // fk helper

    }

    #endregion

    #region  Question Domain Models

    /// <summary>
    ///  Question Type Lookup Model
    /// </summary>
    [Table("QuestionTypeLookup")]
    public class QuestionTypeLookup
    {

        private string _type;
        [Key]
        public string type
        {
            get
            {
                return _type;
            }
            set
            {
                _type = HtmlRemoval.Strip(value);
            }
        }

    }

    /// <summary>
    ///  Question Model
    /// </summary>
    [Table("Questions")]
    public class Questions
    {

        [Key]
        public int id { get; set; }

        private string _question;
        public string question
        {
            get
            {
                return _question;
            }
            set
            {
                _question = HtmlRemoval.Strip(value);
            }
        }

        public int order { get; set; }

        private string _type;
        public string type
        {
            get
            {
                return _type;
            }
            set
            {
                _type = HtmlRemoval.Strip(value);
            }
        } // fk Type
        public QuestionTypeLookup QuestionTypeLookup { get; set; } // fk helper

        public int fileId { get; set; } // fk FileId
        public File File { get; set; } // fk helper

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

    }

    /// <summary>
    ///  Option model (mult choice, single answer)
    /// </summary>
    [Table("Options")]
    public class Options
    {

        [Key]
        public int id { get; set; }

        private string _option;
        [Column("Option", TypeName = "VARCHAR"), StringLength(8000)]
        public string option
        {
            get
            {
                return _option;
            }
            set
            {
                _option = HtmlRemoval.Strip(value);
            }

        }

        public int questionsId { get; set; } // fk QuestionId
        public Questions Questions { get; set; } // fk helper

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

    }

    #endregion

    #region Responses/Answers Domain Models

    /// <summary>
    ///  Response model (answers to questions are stored here)
    /// </summary>
    [Table("Responses")]
    public class Responses
    {
        [Key]
        public int id { get; set; }

        private string _response;
        [Column("Response", TypeName = "VARCHAR(MAX)")]
        public string response
        {
            get
            {
                return _response;
            }
            set
            {
                _response = HtmlRemoval.Strip(value);
            }
        }

        public bool respondedTo { get; set; }

        public int questionsId { get; set; } // fk QuestionsId
        public Questions Questions { get; set; } // fk helper

        public int newFileInstanceId { get; set; } // fk NewFileInstaceId
        public NewFileInstance NewFileInstance { get; set; } // fk helper

        private string _created_at;
        public string created_at
        {
            get
            {
                return _created_at;
            }
            set
            {
                _created_at = HtmlRemoval.Strip(value);
            }
        }

        private string _updated_at;
        public string updated_at
        {
            get
            {
                return _updated_at;
            }
            set
            {
                _updated_at = HtmlRemoval.Strip(value);
            }
        }

    }

}

    #endregion

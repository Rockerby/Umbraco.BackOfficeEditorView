using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackOfficeEditorView.Core.Models
{
    public class UserContentView
    {
        [JsonProperty("dateLogged")]
        public DateTime DateLogged { get; set; } = DateTime.UtcNow;
        [JsonProperty("sessionId")]
        public string SessionId { get; set; }
        [JsonProperty("userId")]
        public int UserId { get; set; }
        [JsonProperty("userName")]
        public string UserName { get; set; }
        [JsonProperty("contentId")]
        public int ContentId { get; set; }
    }
}

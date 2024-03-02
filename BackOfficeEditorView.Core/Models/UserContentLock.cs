using Newtonsoft.Json;

namespace BackOfficeEditorView.Core.Models
{
    public class UserContentLock
    {
        [JsonProperty("dateLogged")]
        public DateTime DateLogged { get; set; } = DateTime.UtcNow;
        [JsonProperty("sessionId")]
        public string SessionId { get; set; }
        [JsonProperty("userId")]
        public int UserId { get; set; }
        [JsonProperty("userName")]
        public string? UserName { get; set; }
        [JsonProperty("userEmail")]
        public string? UserEmail { get; set; }
        [JsonProperty("contentId")]
        public int? ContentId { get; set; }
        [JsonProperty("culture")]
        public string? Culture { get; set; }
    }
}

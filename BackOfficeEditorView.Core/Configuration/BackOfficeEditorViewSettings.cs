using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackOfficeEditorView.Core.Configuration
{
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
    public class BackOfficeEditorViewSettings
    {
        public string Name { get; set; }
        public bool CanLockContent { get; set; }
        public bool IsCultureAware { get; set; }
    }
}

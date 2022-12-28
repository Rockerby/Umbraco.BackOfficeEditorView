using BackOfficeEditorView.Core.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackOfficeEditorView.Core
{
    public class BackOfficeEditorViewConfigService
    {
        public BackOfficeEditorViewSettings Settings => _settingsMonitor.CurrentValue;

        private IOptionsMonitor<BackOfficeEditorViewSettings> _settingsMonitor;
        
        public BackOfficeEditorViewConfigService(
            IOptionsMonitor<BackOfficeEditorViewSettings> settingsOptionsMonitor)
        {
            _settingsMonitor = settingsOptionsMonitor;
        }
    }
}

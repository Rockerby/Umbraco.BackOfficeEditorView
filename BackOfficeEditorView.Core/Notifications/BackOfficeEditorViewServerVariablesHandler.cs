using System.Collections.Generic;
using System.Linq;
using BackOfficeEditorView.Core.Hubs;
using Microsoft.AspNetCore.Routing;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Security;
using Umbraco.Extensions;

namespace BackOfficeEditorView.Core.Notifications
{
    /// <summary>
    /// Adds required variables into javascript to use within Umbraco BackOffice
    /// </summary>
    internal class BackOfficeEditorViewServerVariablesHandler : INotificationHandler<ServerVariablesParsingNotification>
    {
        private readonly BackOfficeEditorViewConfigService _config;
        private readonly LinkGenerator _linkGenerator;
        private readonly BackOfficeEditorViewHubRoutes _hubRoutes;
        private readonly IBackOfficeSecurityAccessor _securityAccessor;

        /// <inheritdoc cref="INotificationHandler{TNotification}" />
        public BackOfficeEditorViewServerVariablesHandler(LinkGenerator linkGenerator,
            BackOfficeEditorViewConfigService configService,
            BackOfficeEditorViewHubRoutes hubRoutes,
            IBackOfficeSecurityAccessor securityAccessor)
        {
            _linkGenerator = linkGenerator;
            _config = configService;
            _hubRoutes = hubRoutes;
            _securityAccessor = securityAccessor;
        }


        /// <inheritdoc/>
        public void Handle(ServerVariablesParsingNotification notification)
        {
            notification.ServerVariables.Add("boev", new Dictionary<string, object>
            {
                { "signalRHub",  _hubRoutes.GetBackOfficeEditorViewHubRoute() },
            });
        }

        public bool ShowFileActions()
        {
            var user = _securityAccessor?.BackOfficeSecurity?.CurrentUser;
            if (user == null) return false;
            return user.Groups.Any(x => x.Alias.Equals(Constants.Security.AdminGroupAlias));
        }

    }

}

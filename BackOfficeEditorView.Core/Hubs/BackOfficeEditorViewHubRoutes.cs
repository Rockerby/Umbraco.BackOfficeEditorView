
using BackOfficeEditorView.Core.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;

using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Hosting;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Routing;
using Umbraco.Extensions;

namespace BackOfficeEditorView.Core.Hubs
{
    /// <summary>
    /// Handles SignalR routes
    /// </summary>
    public class BackOfficeEditorViewHubRoutes : IAreaRoutes
    {
        private readonly IRuntimeState _runtimeState;
        private readonly string _umbracoPathSegment;

        public BackOfficeEditorViewHubRoutes(
            IOptions<BackOfficeEditorViewSettings> boevSettings,
            IOptions<GlobalSettings> globalSettings,
            IHostingEnvironment hostingEnvironment,
            IRuntimeState runtimeState)
        {
            _runtimeState = runtimeState;

            _umbracoPathSegment = globalSettings.Value.GetUmbracoMvcArea(hostingEnvironment);
        }

        /// <summary>
        /// Create the SignalR routes
        /// </summary>
        public void CreateRoutes(IEndpointRouteBuilder endpoints)
        {
            if (_runtimeState.Level == Umbraco.Cms.Core.RuntimeLevel.Run) 
                endpoints.MapHub<SyncHub>(GetBackOfficeEditorViewHubRoute());
        }

        /// <summary>
        /// Get the path to the SignalR hub
        /// </summary>
        public string GetBackOfficeEditorViewHubRoute()
            => $"/{_umbracoPathSegment}/{nameof(SyncHub)}";
    }
}

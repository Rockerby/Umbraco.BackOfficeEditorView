using BackOfficeEditorView.Core.Configuration;
using BackOfficeEditorView.Core.Hubs;
using BackOfficeEditorView.Core.Notifications;
using BackOfficeEditorView.Core.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Web.Common.ApplicationBuilder;

namespace BackOfficeEditorView.Core
{
    public static class BackOfficeEditorViewBuilderExtensions
    {
        public static IUmbracoBuilder AddBackOfficeView(this IUmbracoBuilder builder, Action<object> defaultOptions = default)
        {
            // Check it's not here before adding it again
            if (builder.Services.FirstOrDefault(x => x.ServiceType == typeof(BackOfficeEditorViewConfigService)) != null)
                return builder;

            var options = builder.Services.AddOptions<BackOfficeEditorViewSettings>()
                .Bind(builder.Config.GetSection("BackOfficeEditorView"));

            if (defaultOptions != default)
            {
                options.Configure(defaultOptions);
            }
            options.ValidateDataAnnotations();

            // Register the services needed to function
            builder.Services.AddScoped<IViewManager, CacheViewManager>();
            builder.Services.AddScoped<IContentLockManager, CacheContentLockManager>();
            builder.Services.AddSingleton<BackOfficeEditorViewConfigService>();
            builder.Services.AddSingleton<BackOfficeEditorViewHubRoutes>();
            builder.Services.AddSignalR();
            builder.Services.AddBackOfficeEditorViewSignalR();

            // Add in the server variables to add into the JS for the back office
            builder.AddNotificationHandler<ServerVariablesParsingNotification, BackOfficeEditorViewServerVariablesHandler>();

            return builder;
        }
        
        public static IServiceCollection AddBackOfficeEditorViewSignalR(this IServiceCollection services)
        {

            services.Configure<UmbracoPipelineOptions>(options =>
            {
                options.AddFilter(new UmbracoPipelineFilter(
                    "BackOfficeEditorView",
                    applicationBuilder => { },
                    applicationBuilder => { },
                    applicationBuilder =>
                    {
                        applicationBuilder.UseEndpoints(e =>
                        {
                            var hubRoutes = applicationBuilder.ApplicationServices.GetRequiredService<BackOfficeEditorViewHubRoutes>();
                            hubRoutes.CreateRoutes(e);
                        });
                    }
                    ));
            });

            return services;
        }
    }
}

using System;
using System.Globalization;
using System.Threading.Tasks;
using BackOfficeEditorView.Core.Models;
using BackOfficeEditorView.Core.Services;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace BackOfficeEditorView.Core.Hubs
{
    public class SyncHub : Hub
    {
        public const string GroupID = "BackOfficeEditorView-signalr";
        private readonly IViewManager _viewManager;

        public SyncHub (IViewManager viewManager)
        {
            _viewManager = viewManager;
        }

        public override async Task OnConnectedAsync()
        {
            // When a user first connects to the SignalR service
            // register them within our users' group
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupID);
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Simple test function that signals all users
        /// </summary>
        /// <returns></returns>
        public async Task HelloWorld()
        {
            await Clients.Group(GroupID).SendAsync("helloWorld");
        }

        /// <summary>
        /// Registers the given user has started viewing to given content
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="contentIdStr"></param>
        /// <returns></returns>
        public async Task RegisterView(object userContentViewObj)
        {
            if (userContentViewObj == null)
                return;

            UserContentView userContentView =
                JsonConvert.DeserializeObject<UserContentView>(userContentViewObj.ToString());
            if (userContentView == null)
                return;

            // Remove views for the user's session
            _viewManager.RemoveBySession(userContentView.SessionId);

            // put it in the repository
            _viewManager.AddUserView(userContentView);

            // broadcast that this person is looking at the content to all
            // Don't worry that this user will be in the list, this is handled
            // in the back office javascript
            await Clients.Group(GroupID).SendAsync("ContentViewed", _viewManager.FetchAllViews());

        }

        public async Task RemoveViewsByUser(object userIdStr)
        {
            if (!Int32.TryParse(userIdStr?.ToString(), out int userId))
                return;

            // Remove all views for the given ID
            _viewManager.RemoveByUser(userId);

            // broadcast that this person is looking at the content to all
            // Don't worry that this user will be in the list, this is handled
            // in the back office javascript
            await Clients.Group(GroupID).SendAsync("ContentViewed", _viewManager.FetchAllViews());
        }

        public async Task RemoveViews(object sessionId)
        {
            if (String.IsNullOrEmpty(sessionId?.ToString()))
                return;

            // Remove all views for the given ID
            _viewManager.RemoveBySession(sessionId.ToString());

            // broadcast that this person is looking at the content to all
            // Don't worry that this user will be in the list, this is handled
            // in the back office javascript
            await Clients.Group(GroupID).SendAsync("ContentViewed", _viewManager.FetchAllViews());
        }


    }
}

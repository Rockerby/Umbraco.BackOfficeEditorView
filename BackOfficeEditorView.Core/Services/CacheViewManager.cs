using BackOfficeEditorView.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Cache;
using Umbraco.Extensions;

namespace BackOfficeEditorView.Core.Services
{
    public class CacheViewManager : IViewManager
    {
        private const string CACHE_KEY = "ViewManagerCurrentViews";
        private readonly IAppPolicyCache _runtimeCache;

        public CacheViewManager(AppCaches appCaches)
        {
            // Grap RuntimeCache from appCaches
            // and assign to our private field.
            _runtimeCache = appCaches.RuntimeCache;
        }

        /// <summary>
        /// Adds the given user view to the repository. If the given session is
        /// already viewing the content they won't be added again.
        /// </summary>
        /// <param name="ucView"></param>
        public void AddUserView(UserContentView ucView)
        {
            var list = FetchAllViews();
            if (list?.FirstOrDefault(a => a.SessionId == ucView.SessionId && a.ContentId == ucView.ContentId) == null) {
                list.Add(ucView);
                _runtimeCache.InsertCacheItem(CACHE_KEY, () => { return list; }, new TimeSpan(1, 0, 0, 0), true);
            }
        }

        public void RemoveBySession(string sessionId)
        {
            var allViews = FetchAllViews();
            // Remove all of the users that match the same ID
            int removedCount = allViews.RemoveAll(a => a.SessionId == sessionId);
            // Only re-push the cache if we actually altered the list
            if(removedCount > 0)
            {
                _runtimeCache.InsertCacheItem(CACHE_KEY, () => { return allViews; }, new TimeSpan(1, 0, 0, 0), true);
            }
        }

        public void RemoveByUser(int userId)
        {
            var allViews = FetchAllViews();
            // Remove all of the users that match the same ID
            int removedCount = allViews.RemoveAll(a => a.UserId == userId);
            // Only re-push the cache if we actually altered the list
            if (removedCount > 0)
            {
                _runtimeCache.InsertCacheItem(CACHE_KEY, () => { return allViews; }, new TimeSpan(1, 0, 0, 0), true);
            }
        }

        public List<UserContentView> FetchAllViews()
        {
            var allViews = _runtimeCache.GetCacheItem(CACHE_KEY, () =>
            {
                return new List<UserContentView>();
            }, new TimeSpan(1, 0, 0, 0), true);

            return allViews;
        }

        public List<UserContentView> FetchCurrentViews(int contentId)
        {
            var allViews = FetchAllViews();

            if (allViews != null)
                return allViews.Where(a => a.ContentId == contentId).ToList();

            return allViews;
        }

        public void ClearCache()
        {
            _runtimeCache.ClearByKey(CACHE_KEY);
        }
    }
}

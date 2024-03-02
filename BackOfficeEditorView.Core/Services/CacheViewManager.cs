using BackOfficeEditorView.Core.Configuration;
using BackOfficeEditorView.Core.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
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
        private readonly bool _isCultureAware;

        public CacheViewManager(AppCaches appCaches, IOptions<BackOfficeEditorViewSettings> settings)
        {
            // Grap RuntimeCache from appCaches
            // and assign to our private field.
            _runtimeCache = appCaches.RuntimeCache;
            _isCultureAware = settings.Value?.IsCultureAware ?? false;
        }

        /// <summary>
        /// Adds the given user view to the repository. If the given session is
        /// already viewing the content they won't be added again.
        /// </summary>
        /// <param name="ucView"></param>
        public void AddUserView(UserContentView ucView)
        {
            var list = FetchAllViews();

            var alreadyExists = list?.Any(a =>
                    a.SessionId == ucView.SessionId
                    && a.ContentId == ucView.ContentId
                    && (!_isCultureAware || (_isCultureAware && a.Culture == ucView.Culture)))
                ?? false;

            if (!alreadyExists)
            {
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

        public List<UserContentView> FetchCurrentViews(int contentId, string? culture = null)
        {
            var allViews = FetchAllViews();

            allViews = allViews?.Where(v => v.ContentId == contentId).ToList();

            if (!string.IsNullOrEmpty(culture))
            {
                allViews = allViews?.Where(v => v.Culture == culture).ToList();
            }

            return allViews;
        }

        public void ClearCache()
        {
            _runtimeCache.ClearByKey(CACHE_KEY);
        }
    }
}

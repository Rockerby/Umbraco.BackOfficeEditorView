using BackOfficeEditorView.Core.Models;
using Umbraco.Cms.Core.Cache;
using Umbraco.Extensions;

namespace BackOfficeEditorView.Core.Services
{
    public class CacheContentLockManager : IContentLockManager
    {
        private const string CACHE_KEY = "UserContentLockManager";
        private readonly IAppPolicyCache _runtimeCache;

        public CacheContentLockManager(AppCaches appCaches)
        {
            _runtimeCache = appCaches.RuntimeCache;
        }

        public List<UserContentLock> AddUserLock(UserContentLock ucLock)
        {
            var userLocks = GetCurrentContentLocks();
            if (userLocks.All(l => l.UserId != ucLock.UserId || l.ContentId != ucLock.ContentId))
            {
                userLocks.Add(ucLock);

                _runtimeCache.InsertCacheItem(
                CACHE_KEY,
                    () => userLocks,
                    new TimeSpan(0, 1, 0, 0));
            }

            return userLocks;
        }

        public List<UserContentLock> RemoveUserLocks(int userId)
        {
            var userLocks = GetCurrentContentLocks();

            var numRemoved = userLocks.RemoveAll(l => l.UserId == userId);

            if (numRemoved > 0)
            {
                _runtimeCache.InsertCacheItem(
                    CACHE_KEY,
                    () => userLocks,
                    new TimeSpan(0, 1, 0, 0));
            }

            return userLocks;
        }

        public List<UserContentLock> GetCurrentContentLocks(int? contentId = null)
        {
            var contentLocks = _runtimeCache.GetCacheItem(
                CACHE_KEY, 
                () => new List<UserContentLock>(), 
                new TimeSpan(0, 1, 0, 0), true);

            if (contentId.HasValue)
            {
                contentLocks = contentLocks?.Where(l => l.ContentId == contentId.Value).ToList();
            }

            return contentLocks ?? new List<UserContentLock>();
        }
    }
}

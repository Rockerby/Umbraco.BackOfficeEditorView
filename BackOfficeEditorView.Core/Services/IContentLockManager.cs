using BackOfficeEditorView.Core.Models;

namespace BackOfficeEditorView.Core.Services
{
    public interface IContentLockManager
    {
        List<UserContentLock> AddUserLock(UserContentLock ucLock);
        List<UserContentLock> RemoveUserLocks(int userId);
        List<UserContentLock> GetCurrentContentLocks(int? contentId = null);
    }
}

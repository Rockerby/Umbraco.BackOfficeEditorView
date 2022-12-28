using BackOfficeEditorView.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackOfficeEditorView.Core.Services
{
    public interface IViewManager
    {
        void AddUserView(UserContentView ucView);
        void RemoveByUser(int userId);
        void RemoveBySession(string sessionId);
        List<UserContentView> FetchAllViews();
        List<UserContentView> FetchCurrentViews(int contentId);

    }
}

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace BackOfficeEditorView.Core
{
    public class BackOfficeEditorViewComposer : IComposer
    {
        /// <inheritdoc/>
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddBackOfficeView();
        }
    }
}
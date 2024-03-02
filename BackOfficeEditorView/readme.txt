Thank you for installing Back Office Editor Viewer!

Just build and run your website to see the icon appear next to the content name in the
Umbraco Back Office to show who else is editing the same content as you.

To enable content locking, simply add the below to you appSettings.json:

  "BackOfficeEditorView": {
    "canLockContent": true
  }

To enable culture aware notifications (and locking if enabled), simply add the below to you appSettings.json:

  "BackOfficeEditorView": {
    "isCultureAware": true
  }

If you have any issues or questions, reach out to me over on GitHub - https://github.com/Rockerby/BackOfficeEditorView
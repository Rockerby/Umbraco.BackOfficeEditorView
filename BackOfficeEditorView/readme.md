# Back Office Editor Viewer
The Umbraco package to let you see who is also looking at the same content as you.  
  
After installing the package you will see an icon next to the name bar of the content. You'll be immediately notification when another user is viewing that content,
either before the started or during your session. Simply click the icon to see who the other editors are.  

To enable content locking, simply add the below to you appSettings.json:  

```
  "BackOfficeEditorView": {
    "canLockContent": true
  }
```
  
If you have any issues or questions, reach out to me over on GitHub - https://github.com/Rockerby/BackOfficeEditorView
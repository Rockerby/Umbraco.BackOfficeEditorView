# Back Office Editor Viewer for Umbraco
The Umbraco package to let you see who is also looking at the same content as you.  

After installing the package you will see an icon next to the name bar of the content. You'll be immediately notified when another user is viewing that content,
either before the start or during your session. Simply click the icon to see who the other editors are.  

To add a locking feature so that other editors can't edit the content while you are, add the following to your appSettings.json:  

```
{
  ...
  
  "BackOfficeEditorView": {
    "canLockContent": true
  }
}
```

By default you will be notified when another user is looking at the same content, regardless of the language being looked at. In order to make the tool culture aware
so that it will only notify if another user is viewing the same content, in the same language, then this can be added with the following setting:

```
{
  ...
  
  "BackOfficeEditorView": {
    "isCultureAware": true
  }
}
```
_Note:_ Locking and culture aware features can be used together to be able to lock only certain languages!

If you have any issues or questions, reach out to me over on GitHub - https://github.com/Rockerby/BackOfficeEditorView  

# plugin-fontsettings

This plugin adds font settings button in the GitBook website.

### Disable this plugin

This is a default plugin and it can be disabled using a `book.json` configuration:

```
{
    plugins: ["-fontsettings"]
}
```

### Configuration

This plugin can be configured in the `book.json`:

Default configuration is:

```js
{
    "pluginsConfig": {
        "fontSettings": {
            "theme": null, // 'sepia', 'night' or 'white',
            "family": 'sans',// 'serif' or 'sans',
            "size": 2 // 1 - 4
        }
    }
}
```


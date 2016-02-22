在使用GitBook的时候，默认GitBook会将所有章节的索引都展开，对于多章节的书籍展示非常不美观。这点不如[Sphinx Doc](http://www.sphinx-doc.org)书籍默认只展示查看的章节。

[gitbook-plugin-toggle-chapters](https://www.npmjs.com/package/gitbook-plugin-toggle-chapters)提供了只展示阅读章节的功能：

```bash
npm install gitbook-plugin-codeblock-filename -g
cd cloud-atlas
gitbook install
```

然后修改`book.json`添加

```json
{
    "plugins": ["toggle-chapters"]
}
```
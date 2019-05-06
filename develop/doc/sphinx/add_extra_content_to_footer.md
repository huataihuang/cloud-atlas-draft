在撰写[云图](https://cloud-atlas.readthedocs.io/zh_CN/latest/index.html)时，想在footer上添加一些内容，例如 "讨论和捐赠" ，则需要定制 footer.html 。

这个功能在[sphinx-doc](http://sphinx-doc.org/) 是通过 `extrafooter` 块实现的，在 `conf.py` 中有一个 `templates_path` （通常是 `/_templates` )，只要将扩展的页面放到该目录下并指定扩展哪个块就可以。

例如，在 `/_templates` 目录下添加一个 `footer.html` 文件，内容如下:

```html
{% extends '!footer.html' %}

{% block extrafooter %}
    <!-- your html code here -->
    <p><a href="http://foo">new example link</a></p>
    {{ super() }}
{% endblock %}
```

然后生成的的sphinx的每个页面底部都会增加一个 foo 链接。

# 参考

* [Newbie question on adding extra content to footer](https://github.com/rtfd/sphinx_rtd_theme/issues/349)
当使用高分辨率的显示器，浏览器的页面显示往往会过于细小。chrome提供了默认的zoom level设置，例如可以默认放大到120%。但是Firefox没有提供设置界面，需要通过隐含参数调整。

* 在浏览器地址栏输入`about:config`并回车
* 搜索`layout.css.devPixelsPerPx`，默认参数是`-1`表示不调整。可以修改成`1.0`则对应标准的96 dpi字体。要设置放大10%，则设置`1.1`。

> 我在MacBook Pro上安装的Linux LXQt桌面，默认的字体显示过小，所以设置`1.2`表示放大到`120%`，则非常清晰美观。
>
> 注意这个值不要设置到 0 和 1 之间的小数，有可能字体太小无法阅读。

# 参考

* [Wanting a different zoom level instead of 100% default zoom.](https://support.mozilla.org/en-US/questions/1147570)
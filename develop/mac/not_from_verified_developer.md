升级到macOS 10.15以后，系统去除了允许从第三方非认证开发者这里安装应用程序的设置，所以当启动Firefox时，始终提示"Firefox Software Update.app can't be launched because it's not from a verified developer"。

由于最新macOS的`system settings -> security`强制去除了允许第三方程序安装运行选项，而firefox启动时需要更新安装一个Install Helper，被禁止后无法启动。

解决方法是在终端中输入以下命令:

```
sudo spctl --master-disable
```

禁用安全限制以后，就可以运行firefox，首次启动运行设置完成后，就可以再次激活安全选项

```
sudo spctl --master-enable
```

# 参考

* [Firefox Software Update can't be opened](https://forums.developer.apple.com/thread/118529)

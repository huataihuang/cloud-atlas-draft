# android filetransfer传输文件

默认的Android 4.x，当USB连接到主机时，有两种模式：

* Media device(MTP)
* Camera(PTP)

使用Camera模式的时候，Android(Nexus)表现为类似一个数码相机，可以用来传输照片。

不过，要传输文件到Nexus手机中，需要使用MTP模式，并且需要下载[android filetransfer](https://www.android.com/filetransfer)安装：

* 安装Android File Transfer
* 启动Android File Transfer，如果提示找不到Device，则打开Nexus手机，从下拉快捷菜单选择`Touch for other USB options`项，将`Camera(PTP)`模式修改成`Media device(MTP)`模式，就可以看到自动打开了文件管理器，可以拖动文件传输到设备中。

> 最高支持4GB文件传输

![Android File Transfer](/img/develop/android/android_file_transfer.png)

# ADB传输文件

`adb`支持传输文件

* 下载文件到电脑

```
adb pull /sdcard/video.mp4 C:\Users\Jonathan\Desktop
```

* 上传文件到手机

```
adb push C:\Users\Jonathan\Desktop\video.mp4 /sdcard/
```

# 使用网络通过浏览器下载文件到手机

在个人电脑上，使用Python内置的`SimpleHTTPServer`模块可以启动一个简单的web下载服务器：

```
python -m SimpleHTTPServer 8000
```

> `SimpleHTTPServer` 是Python 2模块，在Python 3中，对应是 `http.server` 即 `python -m http.server 8000`

> 监听在端口`8000`上，在Android使用浏览器访问`http://<host_ip>:8000`就可以看到共享的目录下文件。

注意：下载文件位于`Downloads`目录下，不能直接被Android中其他应用程序读取。例如，`.pdf`下载到`Downloads`目录下就不能直接通过`kindle`加载阅读。但是，只要把文件移动到`Documents`目录下就可以直接通过Kindle进行浏览。

> Kindle支持`pdf`和没有DRM加密的电子书阅读，所以只要把文件存放到`Documents`目录下，就可以通过Kindle阅读，不需要安装第三方软件。

# 参考

* [Transfer music from a computer to a device](https://support.google.com/googleplay/answer/1101500?hl=en)
* [Android customization – how to transfer files using ADB push and pull commands](http://www.androidauthority.com/android-customization-transfer-files-adb-push-adb-pull-601015/)

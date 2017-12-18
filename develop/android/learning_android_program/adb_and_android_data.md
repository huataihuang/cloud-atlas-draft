# Android 调试桥

Android Debug Bridge(`adb`)是客户端-服务器程序，包括三个组件：

* 客户端，该组件发送命令。客户端在开发计算机上运行。通过发出 adb 命令从命令行终端调用客户端。
* 后台程序，该组件在设备上运行命令。后台程序在每个模拟器或设备实例上作为后台进程运行。
* 服务器，该组件管理客户端和后台程序之间的通信。服务器在开发计算机上作为后台进程运行。

## adb 的工作方式

启动一个 adb 客户端时，此客户端首先检查是否有已运行的 adb 服务器进程。如果没有，它将启动服务器进程。当服务器启动时，它与本地 TCP 端口 `5037` 绑定，并侦听从 adb 客户端发送的命令—所有 adb 客户端均使用端口 `5037` 与 adb 服务器通信。

然后，服务器设置与所有运行的模拟器/设备实例的连接。它通过扫描 `5555` 到 `5585` 之间（模拟器/设备使用的范围）的奇数号端口查找模拟器/设备实例。服务器一旦发现 adb 后台程序，它将设置与该端口的连接。请注意，每个模拟器/设备实例将获取一对按顺序排列的端口 — 用于控制台连接的偶数号端口和用于 adb 连接的奇数号端口。例如：

```
模拟器 1，控制台：5554
模拟器 1，adb：5555
模拟器 2，控制台：5556
模拟器 2，adb：5557
以此类推... 
```

## 设备上启用 adb 调试

要在通过 USB 连接的设备上使用 adb，必须在设备系统设置中启用 `USB debugging`（位于 `Developer options` 下）。

Android 4.2 及更高版本的设备上，`Developer options` 屏幕默认情况下处于隐藏状态。如需将其显示出来，请转到 `Settings > About phone` 并点按 `Build number` 七次。返回上一屏幕，在底部可以找到 `Developer options`。

> 执行 `adb devices` 来验证设备是否连接

## 通过 WLAN 连接到设备

一般情况下，通过 USB 使用 adb。不过，也可以按照下面的说明通过 WLAN 使用它。 

* 将 Android 设备和 adb 主计算机连接到这两者都可以访问的常用 WLAN 网络
* 使用 USB 电缆将设备连接到主计算机
* 设置目标设备以侦听端口 5555 上的 TCP/IP 连接

```
adb tcpip 5555
```

* 从目标设备断开 USB 电缆连接。 
* 查找 Android 设备的 IP 地址:
  * 在 Nexus 设备上，通过访问 `Settings > About tablet（或 About phone) > Status > IP address` 查找 IP 地址
  * 在 Android Wear 设备上，通过访问 `Settings > Wi-Fi Settings > Advanced > IP address` 查找 IP 地址。
* 连接至设备，通过 IP 地址识别此设备。

```
adb connect device_ip_address
```

* 请确认计算机已连接至目标设备：

```
adb devices
```

# 将命令发送至特定设备

如果多个模拟器/设备实例正在运行，在发出 adb 命令时必须指定一个目标实例 - 使用 `-s` 选项

```
adb -s serial_number command 
```

举例：

```
adb -s emulator-5556 install helloWorld.apk
```

# 安装应用

可以使用 adb 从开发计算机复制应用，并将其安装到模拟器/设备实例上。使用 `install` 命令，必须指定您要安装的 APK 文件的路径：

```
adb install path_to_apk
```

# 设置端口转发

可以使用 `forward` 命令设置任意端口转发 — 将对特定主机端口的请求转发到模拟器/设备实例上的其他端口。

以下案例设置主机端口 `6100` 到模拟器/设备端口 `7100` 的转发：

```
adb forward tcp:6100 tcp:7100
```

也可以使用 `adb` 设置传输到指定的抽象 UNIX 网域套接字的转发，如下所示：

```
adb forward tcp:6100 local:logd 
```

# 将文件复制到设备/从设备复制文件

使用 `adb` 命令 `pull` 和 `push` 将文件复制到模拟器/设备实例或从其中复制文件。与 `install` 命令不同（其仅将 APK 文件复制到特定位置），`pull` 和 `push` 命令允许将任意目录和文件复制到模拟器/设备实例中的任意位置。

要从模拟器或设备复制文件或目录（及其子目录），请使用

```
adb pull remote local
```

要将文件文件或目录（及其子目录）复制到模拟器或设备，请使用

```
adb push local remote
```

上述命令中，local 和 remote 指的是开发计算机（本地）和模拟器/设备实例（远程）上目标文件/目录的路径。例如：

```
adb push foo.txt /sdcard/foo.txt
```

# 停止 adb 服务器

在某些情况下，可能需要终止 `adb` 服务器进程，然后重启它以解决问题（例如，如果 adb 不响应命令）。

要停止 `adb` 服务器，请使用 `adb kill-server` 命令。然后可以通过发出任意其他 `adb` 命令重启服务器。

----

# 发出 shell 命令

使用 shell 命令通过 adb 发出设备命令，可以进入或不进入模拟器/设备实例上的 adb 远程 shell:

```
adb [-d|-e|-s serial_number] shell shell_command
```

或者，使用如下命令进入模拟器/设备实例上的远程 shell：

```
adb [-d|-e|-s serial_number] shell
```

当准备退出远程`shell` 时，按 `Control + D` 或输入 `exit`。 

# 调用 Activity Manager (am)

在 `adb shell` 中，可以使用 `Activity Manager (am)` 工具发出命令以执行各种系统操作，如启动 Activity、强行停止进程、广播 intent、修改设备屏幕属性及其他操作。在 shell 中，此语法为：

```
am command
```

也可以直接从 adb 发出 Activity Manager 命令，无需进入远程 shell。例如：

```
adb shell am start -a android.intent.action.VIEW
```

# 调用软件包管理器 (pm)

在 adb shell 中，可以使用软件包管理器 (pm) 工具发出命令，以对设备上安装的应用软件包进行操作和查询。在 shell 中，此语法为：

```
pm command
```

可以直接从 adb 发出软件包管理器命令，无需进入远程 shell。例如：

```
adb shell pm uninstall com.example.MyApp
```

# 进行屏幕截图

`screencap` 命令是一个用于对设备显示屏进行屏幕截图的 shell 实用程序。在 shell 中，此语法为：

```
screencap filename
```

要从命令行使用 screencap，请输入以下命令：

```
adb shell screencap /sdcard/screen.png
```

以下屏幕截图会话示例向您展示使用 adb shell 捕获屏幕截图，并使用 pull 命令从设备下载此文件：

```
$ adb shell
shell@ $ screencap /sdcard/screen.png
shell@ $ exit
$ adb pull /sdcard/screen.png
```

# 录制视频

screenrecord 命令是一个用于录制设备（运行 Android 4.4（API 级别 19）及更高版本）显示屏的 shell 实用程序。此实用程序将屏幕 Activity 录制到 MPEG-4 文件。

> 注：音频不与视频文件一起录制。

要从命令行使用 screenrecord，请输入以下命令：

```
$ adb shell screenrecord /sdcard/demo.mp4
```

按 `Control + C` 停止屏幕录制，否则，到三分钟或 `--time-limit` 设置的时间限制时，录制将自动停止。

screenrecord 实用程序可以任何支持的分辨率和所需的比特率进行录制，同时保留设备显示屏的纵横比。默认情况下，此实用程序以原生显示分辨率和屏幕方向进行录制，最大时长为三分钟。

# 读取应用的 ART 配置文件

从 Android 7.0（API 级别 24）开始，Android Runtime (ART) 会收集已安装应用的执行配置文件，其可用于优化应用性能。如，检查收集的配置文件，以了解在应用启动期间，系统决定频繁执行哪些方法和使用哪些类。

要生成配置文件信息的文本表单，请使用以下命令：

```
adb shell cmd package dump-profiles package
```

要检索生成的文件，请使用：

```
adb pull /data/misc/profman/package.txt
```

----

# root权限访问Android设备

默认`adb`访问android是非root权限，所以有些目录不能直接读取。如果要访问需要root权限的目录，可以在主机上先执行`adb root`重启`adbd`服务使之具有root权限，就可以访问Android设备的任何目录。

此时还要在对应的Android设备上通过`Developer Options`设置允许 `root` 访问。

> 参考[Android: adb: Permission Denied](https://stackoverflow.com/questions/7399028/android-adb-permission-denied))


# 应用程序数据目录

所有的应用程序（root或非root）有一个默认的数据目录，位于`/data/data/<package_name>`。这个目录下包含了应用的数据库，设置和其他所有数据。如果app需要大量的数据存储，或者其他原因不适合内部存储，则有对应SDCard的存储目录`Android/data/<package_name>`。

> 需要`root`权限才能够访问其他应用数据目录

# 参考

* [Android调试桥](https://developer.android.com/studio/command-line/adb.html)
* [Where Android apps store data?](https://android.stackexchange.com/questions/47924/where-android-apps-store-data)
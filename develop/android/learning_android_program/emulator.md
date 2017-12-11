Android Emulator 可以模拟设备并将其显示在开发计算机上。利用该模拟器，可对 Android 应用进行原型设计、开发和测试，无需使用硬件设备。

# Android Virtual Device 配置

模拟器使用 Android Virtual Device (AVD) 配置确定被模拟设备的外观、功能和系统映像。利用 AVD，可以定义被模拟设备特定的硬件方面，也可以创建多个配置来测试不同的 Android 平台和硬件排列。

# 系统映像

Android Emulator 运行完整的 Android 系统堆栈（一直深入至内核级别），此堆栈包含一套预安装的应用。通过 AVD Manager 获得的 Android 系统映像包含适用于 Android Linux 内核、原生库、VM 和各种 Android 软件包（例如 Android 框架和预安装应用）的代码。


# 参考

* [在 Android Emulator 上运行应用](https://developer.android.com/studio/run/emulator.html)
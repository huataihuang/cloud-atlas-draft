Android Emulator 可以模拟设备并将其显示在开发计算机上。利用该模拟器，可对 Android 应用进行原型设计、开发和测试，无需使用硬件设备。

# Android Virtual Device 配置

模拟器使用 Android Virtual Device (AVD) 配置确定被模拟设备的外观、功能和系统映像。利用 AVD，可以定义被模拟设备特定的硬件方面，也可以创建多个配置来测试不同的 Android 平台和硬件排列。

# 系统映像

Android Emulator 运行完整的 Android 系统堆栈（一直深入至内核级别），此堆栈包含一套预安装的应用。通过 AVD Manager 获得的 Android 系统映像包含适用于 Android Linux 内核、原生库、VM 和各种 Android 软件包（例如 Android 框架和预安装应用）的代码。

# 关于 AVD

利用 Android Virtual Device (AVD) 定义，可以定义要在 Android Emulator 中模拟的 Android 电话、平板电脑、Android Wear 或 Android TV 设备的特征。

AVD 包括硬件配置文件、系统映像、存储区域、皮肤和其他属性。

> 可能需要使用最新版本的A

```
Operating system: Linux
                  0.0.0 Linux 4.13.16-302.fc27.x86_64 #1 SMP Thu Nov 30 15:33:36 UTC 2017 x86_64
CPU: amd64
     family 6 model 70 stepping 1
     1 CPU

Crash reason:  SIGSEGV
Crash address: 0x0
Process uptime: not available

Thread 14 (crashed)
 0  qemu-system-i386 + 0x5d3f71
    rax = 0x0000000000000000   rdx = 0x0000000000000000
    rcx = 0x0000000000000000   rbx = 0x0000000000f00630
    rsi = 0x0000000000f65808   rdi = 0x0000000000000000
    rbp = 0x00000000012cd548   rsp = 0x00007fc2177fd530
     r8 = 0x0000000000000000    r9 = 0x0000000000000016
    r10 = 0x00000000000001a4   r11 = 0x0000000000000000
    r12 = 0x00007fc1d94d4250   r13 = 0x0000000000000000
    r14 = 0x00007fc1d8079c00   r15 = 0x0000000000000001
    rip = 0x00000000009d3f71
    Found by: given as instruction pointer in context

    Stack contents:
     00007fc2177fd530 30 06 f0 00 00 00 00 00                          0.......        
    Possible instruction pointers:

 1  qemu-system-i386 + 0xb00630
    rsp = 0x00007fc2177fd538   rip = 0x0000000000f00630
    Found by: stack scanning

    Stack contents:
     00007fc2177fd538 28 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  (...............
     00007fc2177fd548 16 00 00 00 00 00 00 00 d0 cb a0 00 00 00 00 00  ................
    Possible instruction pointers:
```

# 创建AVD

* 

* 启动Virtual Device Configuration

在 AVD Manager 的 Your Virtual Devices 页面中，点击 Create Virtual Device。

或者，从 Android Studio 中运行您的应用。在 Select Deployment Target 对话框中，点击 Create New Emulator。



# 参考

* [在 Android Emulator 上运行应用](https://developer.android.com/studio/run/emulator.html)
* [创建和管理虚拟设备](https://developer.android.com/studio/run/managing-avds.html)
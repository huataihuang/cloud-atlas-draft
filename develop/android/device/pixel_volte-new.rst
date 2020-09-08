.. _pixel_volte:

==============
Pixel VoLTE
==============

入手 :ref:`pixel` 手机，经过一周的调教，已经如丝般滑顺(前提是摈弃所有国产软件)，并且root之后的Android提供了超越iOS的便利之处。

然而，中国移动运营商摒弃2G/3G技术导致很多地方如果没有VoLTE的4G语音技术加持，几乎无法正常通话。这就遇到一个尴尬的难题：自从2010年，Google被迫退出中国市场之后，已经没有正式渠道能够获得官方的产品和技术支持。同样Pixel以及后几代产品，在中国市场上只有水货，并且没有得到运营商VoLTE的数据配置支持。这是中国消费者的悲哀...

硬件支持
=========

Pixel 和 Pixel XL硬件上是支持VoLTE技术的(2016底年印度市场Pixel已经通过更新Android Nougat 7.1.1 OTA支持VoLTE)，并且当前Google Android系统对于支持VoLTE技术是非常友好的，只要运营商提供了配置，就可以直接开启。然而，不幸的是在中国市场上的运营商都没有提供配置。

通过电话拨号: ``*#*#4636#*#*`` 可以进入 ``Testing`` 设置，然后再点 ``Phone Info`` 其中就可以看到 ``VoLTE Provisioned`` 是灰色不可设置项。

可以通过 `Magisk voenabler <https://github.com/edgd1er/voenabler>`_ (XDA原帖见 `VoLTE & VoWiFi Enabler (2018-09-20) <https://forum.xda-developers.com/apps/magisk/module-v4-volte-enabler-t3649613>`_ ) 激活VoLTE功能，原理就是修改 `vender/build.prop` 添加激活volte的配置::

   # Debug Options
   persist.dbg.ims_volte_enable=1 
   persist.dbg.volte_avail_ovr=1 
   persist.dbg.vt_avail_ovr=1
   persist.dbg.wfc_avail_ovr=1

   # Radio Options
   persist.radio.rat_on=combine
   persist.radio.data_ltd_sys_ind=1
   persist.radio.data_con_rprt=1
   persist.radio.calls.on.ims=1

从 `GitHub Magisk-Module-Repo <https://github.com/Magisk-Modules-Repo>`_ 下载... 目前已经没有直接下载的voenabler模块，不过原作者的 `GitHub Toucan-Sam VoEnabler <https://github.com/Toucan-Sam/VoEnabler>`_ 有很多fork出来的项目，例如 `edgd1er / voenabler <https://github.com/edgd1er/voenabler/releases>`_ 提供直接直接可用适合最新Magisk's module template 20.x的版本，可以直接下载：`voenabler-v1.6.zip 
<https://github.com/edgd1er/voenabler/releases/download/v1.6/voenabler-v1.6.zip>`_

- 将 ``voenabler-v1.6.zip`` 推送到手机::

   adb push voenabler-v1.6.zip /sdcard/

- 启动Magisk程序，然后选择菜单 ``Modules`` ，并点击屏幕上 ``+`` 按钮，并通过文件管理器找到 ``voenabler-v1.6.zip`` 进行安装

- 安装以后按照提示重启手机，重启以后在 ``Settings => Network & Internet => Mobile network`` 中查看，就可以看到增加了一项 ``VoLTE`` 选项并且已经激活：

.. figure:: ../../_static/android/hack/volte_pixel.png
   :scale: 75

- 验证VoLTE功能：

启用LTE 4G上网浏览网页，同时拨打10086听语音，如果语音同时还能够上网，则表示VoLTE工作正常。

.. note::

   很不幸，虽然此时激活了VoLTE开关，但是实际上该功能还是无效的，电话同时并不能上网。这是因为此时手机中缺少中国地区运营商参数配置(因为Google压根就没有和中国三大运营商合作 - 中国政府不会允许的)。解决方法是从其他国产手机(如小米)提取国内运营商的VoLTE配置，制作成Magisk模块加载。

Android 10
==============

参考 `[GUIDE]Enable VoLTE for unsupported carriers <https://forum.xda-developers.com/pixel-2/how-to/guide-enable-volte-unsupported-carriers-t3892659>`_ 提示，对于Android 10需要使用PDC tool。

我借鉴 `Pixel 2 在 Android 10 破解电信 <https://www.dazhuanlan.com/2020/03/25/5e7a58b221177/>`_ 和 `一加3T氧OS启用电信VoLTE <https://kn007.net/topics/oneplus-3t-oxygen-os-enable-china-telecom-volte/>`_ 方法。

- 从 `QPST TOOL网站 <https://qpsttool.com>`_ 下载 QPST Tool

.. note::

   QPST Tool在Windows 7上安装运行需要首先在操作系统安装 Microsoft .NET Framework 4。

- 需要打开诊断端口 9091 ，一加Onplus是集成提供了这个调试工具的，但是如果使用 LineageOS则需要通过 adb 的 root 进入9091模式::

   adb shell
   su
   setprop sys.usb.config diag,serial_smd,rmnet_qti_bam,adb

我不确定Google官方镜像有没有提供这个功能，待验证

- 操作方法参考 `高通平台modem部分mbn文件的OTA和PDC升级方法 <https://blog.csdn.net/LoongEmbedded/article/details/80844336>`_

.. note::

    目前看起来Pixel不太好解决VolTE功能，现有解决方案都是基于Pixel 2的方法，例如 `Android 10 开启diag端口 破解电信4G+开启VOLTE通话（保留数据） <http://bbs.gfan.com/android-9623353-1-1.html>`_

参考
======

- `Does the Google Pixel 1 support VoLTE? <https://www.quora.com/Does-the-Google-Pixel-1-support-VoLTE>`_
- `How to enable VoLTE on Pixel? <https://forum.xda-developers.com/pixel-xl/help/how-to-enable-volte-pixel-t3685855>`_
- `Enable China Telecom LTE by modifying modem partitions <https://forum.xda-developers.com/pixel-xl/how-to/guide-enable-china-telecom-lte-t3782538>`_ - 这个帖子是从一加手机中复制出运营商配置信息
- `Pixel2(2XL) Anroid 8+/9.0 破解电信4G网络+开启VOLTE通话 <http://bbs.gfan.com/android-9536094-1-1.html>`_ - 这个帖子是指导如何手工一步步启用VoLTE的方法，对于直接使用Magisk包不生效的时候，可以尝试
- `Magisk-Module-Repo/chinese_sim_supporter <https://github.com/Magisk-Modules-Repo/chinese_sim_supporter>`_ 支持Pixel 3在中国运营商环境(中国移动/联通/电信)开启VoLTE
- `高通平台modem部分mbn文件的OTA和PDC升级方法 <https://blog.csdn.net/LoongEmbedded/article/details/80844336>`_

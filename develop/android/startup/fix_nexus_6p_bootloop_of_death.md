很不幸，最近我的Nexus 6P遇到了"重启门"，据说一种可能是CPU虚焊，这种情况需要返修或者通过淘宝店重新焊接CPU；另一种可以通过重新刷特定boot.img来修复，但是不一定对所有手机有效。好在我对手机已经解锁过，所以死马当活马医，按照后者方法尝试一下。

# 高通snapdragon 615大核a57故障

导致Nexus 6P无限重启的原因是设备进入了BLOD，这个问题和BIG cluster(大核)的硬件故障有关。解决方法是关闭BIG核心。但是这意味着手机性能下降。

实际上和Nexus 6P使用相同处理器(高通snapdragon 615)都存在相同的问题，这款手机处理器小核是a53，大核是a57，出问题的是大核a57。这款snapdragon 615处理器被用于 6p/5x/G4/V10 ，都存在大核硬件隐患。

对于8核心都snapdragon 615，小核部分是cpu 0 - cpu 3，大核部分是cpu 4 - cpu 7。其中小核心的1 GHz，大核心 1.7G Hz。

关闭大核工作，需要修改 boot.img ，这也就是为什么手机需要bootload解锁。不过，XCnathan32也提供了一个 [签名的boot.img](http://www.thepetitionsite.com/takeaction/577/779/992/) - 可以直接在没有解锁的手机上使用。 

注意：要修改系统的boot.img

# 其他绕过大核问题启动方法

还有一个根据上述原理利用手机电源管理功能来绕过大核无法工作的启动方法：

* 用电吹风将手机加热到40度以上，这样就会强制只使用4个小核启动，就绕过了上述硬件问题是的手机启动成功
* 将手机电量消耗到10%以下，也会使得手机强制关闭大核只使用小核启动，不过这种操作只有非常小的时间窗口，因为电量可能不能完整支持启动完成

> 此外，Nexus 6P的电池是一个固疾，实际上你需要更换电池才能将处理器策略设置成性能优先

# 性能优化

* 在XDA的原帖中，开发者给出了一个解决方法：由于Nexus 6P所有后台任务只使用了1个核心，所以通过修改ramdisk方式激活后台使用所有4个核心，就能够大幅缓解这个性能下降问题。
* Disable animations in developer options, it helps a lot. 在开发者模式中禁止动画效果，可以提高性能

* Overclock little cores with EX kernel, I have mine set to 1632 MHz and everything is working fine so far. `使用EX内核进行超频，可以超频到 1632 MHz` #180

```
    Flashed boot.img
    Flashed TWRP
    Flashed vendor.img from PureNexus
    Flashed PureNexus
    gapps
    su
    modified EX kernel with max CPU 1632 MHz

Then after booting I used Kernel Auditor to set governor etc.

Here are my governor settings:
CPU min: 600MHz
CPU max: 1632MHz
CPU Governor: Performance
Input Boost Frequency Core 1-4: 1344MHz
Touch Boost: Enabled

GPU Governor: Performance
```

* Set CPU governor to performance (or some aggressive governor), with the BIG cores disabled, the battery is already much better, so using a better performance governor shouldn't be a problem for battery life.  将处理器策略设置成性能优先，由于处理器的大核已经被禁用，所以电池消耗已经大为改善，这样设置性能优先策略也不会影响电池寿命

其他优化：

* PureNexus ROM, modified EX kernel, 1632 MHz OC, Interactive governor, 1080p resolution with 400 dpi, all animations turned off in developer options, and "Force GPU rendering" and "Disable HW overlays" turned on in developer options. Other than the little core OC, all other options were kept default in the EX kernel installer. 

`实际我尝试自己定制Android 8.1启动的boot.img还是没有解决启动` - 原因可能是 xls654 所说 [SELinux相关](https://forum.xda-developers.com/showpost.php?p=73492282)

由于我基本不再使用Nexus 6P，所以放弃这个自定义boot.img，改为采用[Nexus 6P Bootloop Fix Has Been Found, Makes Your Phone Use 4 Cores](https://www.xda-developers.com/nexus-6p-bootloop-fix/)方法，直接使用Android 7.1.2镜像并刷入对应的boot.img和EX内核。

# 操作步骤

* 启动手机进入bootloader状态 - 同时按住 `电源` 和 `音量递减` 键

* 执行解锁 - 解锁是为了能够刷入定制的boot.img

```
fastboot flashing unlock
```

* 解压缩下载的工厂镜像（可选，我是修复系统，重新刷了7.1.2）

```
unzip angler-n2g48c-factory-6a21e528.zip
```

* 执行 `flash-all` 脚本，安装  bootloader, baseband firmware(s), 和操作系统

```
cd angler-n2g48c
./flash-all.sh
```

* 刷入定制只使用4个核心的TWRP [twrp3_1_1_4Cores.img](https://www.dropbox.com/s/bf9ug30v6uji1gt/twrp3_1_1_4Cores.img?dl=0)

```
fastboot flash recovery twrp3_1_1_4Cores.img
```

* 下载定制过的只使用4核心的镜像 [N2G48B_4Cores.img](https://www.dropbox.com/s/65newjmcul32ylw/N2G48B_4Cores.img?dl=0) ，然后将其刷入手机

```
fastboot flash boot N2G48B_4Cores.img
```

现在重启手机，已经可以看到手机正常启动了。不过，此时由于只激活了4个小核，性能会比较差。

* (可选)由于我们已经刷入了定制的TWRP，所以可以通过TWRP将修改过的Elemental X kernel覆盖手机的系统，这样可以提高性能

参考 [Sideload Flashable ZIPs on Android with TWRP](https://android.gadgethacks.com/how-to/sideload-flashable-zips-android-with-twrp-0176529/) 将Magisk加载到TWRP中，然后通过TWRP安装

首先将售价启动到fastboot，然后进入Recovery模式

此时执行 `adb devices` 显示状态

```
List of devices attached
KYV7N15C03000136	recovery
```

在TWRP中选择 `Advanced` => `Sideload`

此时执行 `adb devices` 显示状态

```
List of devices attached
KYV7N15C03000136	sideload
```

然后执行以下命令sideload文件EX4_1_1_4Cores.zip到TWRP进行安装，这样就可以安装好性能优化且使用4核心的Elemental X kernel

```
adb sideload EX4_1_1_4Cores.zip
```

# 性能优化

* 在开发者模式中优化性能
    * 关闭所有动画效果
    * CPU governor设置为性能优先
    * 关闭系统自动更新(因为Google已经没有更新了)

* 关闭加密

Nexus 6P是强制启用加密功能的，而且在设置中无法关闭。要关闭6P的加密功能，需要刷入一个关闭加密功能的内核，然后格式化用户数据和缓存，这样重启以后手机就不会采用加密功能。详细请参考 [Disable Forced Encryption and Decrypt Nexus 6P](https://www.thecustomdroid.com/decrypt-nexus-6p/) 和 [Disable Force Encryption and Decrypt Nexus 6P](https://rootmygalaxy.net/disable-force-encryption-and-decrypt-nexus-6p/)

下载修改过的 boot image [angler-mdb08k-boot.zip](http://forum.xda-developers.com/attachment.php?attachmentid=3521576&d=1446029654)

然后执行：

```
adb reboot bootloader
```

在bootloader模式下，刷入修改过的启动镜像

```
fastboot flash boot decryptedboot.img
```

然后清除加密用户数据

```
fastboot format userdata
```

重启手机即不再自动加密

这里又有一个问题，实际上虽然内核是强制加密的，但是实际上我并没有设置加密密码。参考 [TWRP decrypt password](https://android.stackexchange.com/questions/207346/twrp-decrypt-password) ，对于TWRP 3.2.3_1 之前版本有一个bug，就是入股使用ROM是Android 8之前版本，就不能解密数据。

解决方法可能是忽略进入，然后直接format data，不过，手机再次重启会加密数据，所以还是需要刷入一个关闭加密功能的内核。

----

# 定制启动内核（放弃）

之前我曾经通过[工厂镜像刷新Nexus 6P](factory_recovery_nexus_6p) 到最新的 8.1.0 版本，所以也尝试参考XCnathan32用户提供的指南，修改内核使用 4 CPU核心。这个步骤不难，但是实际上在Android 8.x 上还需要做其他修正，我暂时没有精力详细研究，这里只做一个记录我的部分实践经验：

> To anyone who wants to make a boot.img with 4 cores: It's actually fairly simple, you need to get abootimg tools on linux. Then unpack the boot.img with abootimg -x (name of your boot.img) Once the image is extracted, there should be a file named bootimg.cfg, edit that file and put in maxcpus=4 in the line that starts with cmdline =. Then repack the image with abootimg --create myboot.img -f bootimg.cfg -k zImage -r initrd.img And viola! You have a (half) working kernel. 

* 先按照 [Nexus 6P工厂镜像恢复](factory_recovery_nexus_6p) 通过工厂镜像完整刷机

注意：这里刷入 TWRP 采用的是特殊的已经设置了4核心配置的版本 [TWRP version 3.1.1](https://www.dropbox.com/s/bf9ug30v6uji1gt/twrp3_1_1_4Cores.img?dl=0)

注意：刷入 TWRP 需要replace boot with recovery

如果使用最新的EX zip，则不需要flash boot.img，只需要刷入TWRP，然后在TWRP中输入EX (待验证)

* 制作自己的启动镜像，将使用CPU核心数调整到4个

我已经下载了 8.1.0 (OPM7.181205.001, Dec 2018) 版本镜像文件  angler-opm7.181205.001-factory-b75ce068.zip 。解压缩

```
unzip angler-opm7.181205.001-factory-b75ce068.zip
```

解压缩以后，在当前目录下有一个子目录 `angler-opm7.181205.001` ，进入该目录，这个目录下有多个文件，其中有一个zip压缩文件 image-angler-opm7.181205.001.zip ，再解开这个文件

```
unzip image-angler-opm7.181205.001.zip
```

得到一系列镜像文件，其中就有 `boot.img`

需要使用Linux平台的 abootimg 工具，我当前使用的是macOS，所以通过Ubuntu提供的一种跨平台虚拟化容器 [multipass](https://multipass.run/) 来运行一个Ubuntu虚拟机，安装对应的工具：

```
apt install abootimg
```

将 `boot.img` 复制到ubuntu服务器上，然后执行以下命令解压缩

```
abootimg -x boot.img
```

得到的多个文件中，有一个是配置文件 `bootimg.cfg` ，修改该文件，在这个配置文件的 `cmdline =` 添加参数 `maxcpus=4` ，然后重新打包

```
abootimg --create myboot.img -f bootimg.cfg -k zImage -r initrd.img
```

> 从原帖来看，在Android O上修复，不仅需要修改使用只4个核心，而且关闭强制加密可以提高性能(待验证)

* 将自定义启动镜像刷入手机

```
fastboot flash boot myboot.img
```

# 参考

* [Fix for Nexus 6P Bootloop of death | 8/22 - Android O Working](https://forum.xda-developers.com/nexus-6p/general/guide-fix-nexus-6p-bootloop-death-blod-t3640279) - 这是解决Nexus 6P无限重启的XDA原帖
* [Nexus 6P Bootloop Fix Has Been Found, Makes Your Phone Use 4 Cores](https://www.xda-developers.com/nexus-6p-bootloop-fix/) - 这片文档总结了 [Fix for Nexus 6P Bootloop of death | 8/22 - Android O Working](https://forum.xda-developers.com/nexus-6p/general/guide-fix-nexus-6p-bootloop-death-blod-t3640279) 的操作步骤，如果你没有耐心完整看完XDA原帖，可以参考这个指南快速修复Nexus 6P重启问题
* [Nexus 6P Bootloop无限重启解决方案——需要已解锁](http://bbs.gfan.com/android-9270440-1-1.html)
* [搬运解决Nexus 6P/5x Bootloop无限重启的办法-需已解锁bootloader](http://bbs.gfan.com/android-9174088-1-1.html)
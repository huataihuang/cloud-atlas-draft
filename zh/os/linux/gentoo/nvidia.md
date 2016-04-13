[x11-drivers/nvdia-drivers](https://packages.gentoo.org/packages/x11-drivers/nvidia-drivers)是nVidia图形卡的显卡驱动，对应的开源替代是[nouveau](https://wiki.gentoo.org/wiki/Nouveau)。

`x11-drivers/nvdia-drivers`是由nVidia公司发布的针对Linux内核的可编译源代码。但是，其中包含了一个和显卡通讯的二进制包。驱动包括2部分，一部分是内核模块，另一部分则是一个X11驱动。这两个部分都包含在一个软件包中。由于nVidia已经打包了他们的驱动，所以在安装驱动之前要坐一些选择。

`x11-drivers/nvidia-drivers`软件包中包含了所有从nVidia提供了支持所有显卡的驱动。

# 内核

nVidia内核驱动会构建针对内核的模块`nvidia.ko`，其中包含了称为`binary blob`的二进制驱动显卡芯片的包，以及一个开源的`glue`部分作为和内核结合的部分。由于内核的每次发布更爱了内部的驱动ABI，也就意味着所有使用这些ABI的驱动也要相应修改。对于开源驱动，特别是随着内核分发的驱动，这个更改是近乎次要的，因为整个驱动到内核其他部分链路的调用得到了代码审核。但是对于`nvidia.ko`，则不能同时完成。一旦ABI修改，就不能修正`glue`，因为没有人知道其他部分是如何使用`glue`的，所以用户在新的没有支持的内核运行`nvidia.ko`就有丢失数据和硬件损坏的风险。

所以新内核发布后，最好暂时先停留在旧版本内核一段时间，等Nvidia发布新的驱动，可能需要几周时间。

* 内核配置

```bash
[*] Enable loadable module support --->
Processor type and features --->
   [*] MTRR (Memory Type Range Register) support
Device Drivers --->
   Graphics support --->
      -*- /dev/agpgart (AGP Support) --->
```

对于AGP显卡，需要支持AGP的模块编译，称为`NvAGP`，不过将AGP编译成模块或直接编译到内核中，都有可能带来性能降低或提升，所以你可能需要都尝试一下。如果不能确定，则使用`in-kernel` AGP。

**注意：对于x86和AMD64处理器，内核`framebuffer`驱动和nVdia提供的二进制驱动冲突，所以如果针对这些CPU，则要移除内核支持如下**

```bash
Device Drivers --->
    Graphics support --->
        Frame buffer Devices --->
            <*> Support for frame buffer devices --->
            < >   nVidia Framebuffer Support
            < >   nVidia Riva support
```

确保没有使用`nouveau`开源驱动

```bash
Device Drivers  --->
    Graphics support  --->
        <*> Direct Rendering Manager (XFree86 4.1.0 and higher DRI support) --->
            < > Nouveau (nVidia) cards
```

对于UEFI系统，`uvesafb`不能工作，如果激活`CONFIG_FB_EFI=y`会导致nvdia驱动初始化问题。

`nvdia-drivers`的ebuild可以自动检测到`/usr/src/linux`软链接指向的内核版本，所以如果有多个内核，可以通过`eselect`来选择正确版本。

# 配置

确保按照[X Server Configuration Guide](https://wiki.gentoo.org/wiki/Xorg/Guide)手册并在`/etc/portage/make.conf`设置`VIDEO_CARDS="nvidia"`。这样安装X Server的时候就会正确安装`x11-drivers/nvidia-drivers`。

如果在`/etc/portage/make.conf`设置了`gtk`，就会安装`media-video/nvidia-settings`，一个图形化监控和配置nVidia显卡的程序。

注意，每次编译内核，都需要重新安装`nVidia`内核模块，也就是再次`emerge x11-drivers/nvidia-drivers`

# Kernel module signing(可选）

如果使用了secure boot kernel signing，则需要在加载Nvidia内核模块之前对其签名：

```bash
perl /usr/src/linux/scripts/sign-file sha512 /usr/src/linux/signing_key.priv /usr/src/linux/signing_key.x509 /lib/modules/Kernel-Version-modules-path/video/nvidia-uvm.ko

perl /usr/src/linux/scripts/sign-file sha512 /usr/src/linux/signing_key.priv /usr/src/linux/signing_key.x509 /lib/modules/Kernel-Version-modules-path/video/nvidia.ko
```cd 

对于驱动版本`358.09`新的模块处理显示模式设置，这个模块也需要签名

```bash
perl /usr/src/linux/scripts/sign-file sha512 /usr/src/linux/signing_key.priv /usr/src/linux/signing_key.x509 /lib/modules/Kernel-Version-modules-path/video/nvidia-modeset.ko
```

# X server

一旦安装好相应的驱动，就要配置X server使用`nvdia`驱动来代替默认的`nv`驱动：`/etc/X11/xorg.conf.d/nvidia.conf`

```bash
Section "Device"
   Identifier  "nvidia"
   Driver      "nvidia"
EndSection
```

运行`eselect`确保X server使用nVidia GLX库

```bash
eselect opengl set nvidia
```

# 激活全局nvidia支持

一些工具，如`media-video/mplayer`和`media-lib/xine-lib`使用一个本地USE flag称为`xvmc`来激活`XvMCNVIDIA`支持，对于高分辨率的电影有用。所以建议添加`xvmc`到USE变量`/etc/portage/make.conf`。此外有些程序也使用`nvidia`这个USE flag，也建议添加。

修改USE flag后，应该使用`emerge -uD --newuse @world`确保配置生效重新编译必要软件包。

# 使用nVidia设置工具

nVidia提供了一个设置工具，可以无需重启X server来使用监视器和修改显示设置，这个软件包就是`media-video/nvidia-settings`，注意需要使用`gtk`的USE flag。

# 激活OpenGL/OpenCL

```bash
eselect opengl set nvidia
eselect opencl set nvidia
```

# 使用

测试显卡

```bash
glxinfo | grep direct
```

应该显示

```bash
direct rendering: Yes
```

可以使用`x11-apps/mesa-progs`软件包提供的`glxinfo`检查，以及运行`glxgears`检查FPS

# 问题排查

* 编译时候报有关"drm"错误

```
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_plane_destroy_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_kms_helper_poll_fini
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_kms_helper_poll_disable
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_kms_helper_poll_init
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_disable_plane
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_cleanup_planes
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_helper_hpd_irq_event
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_crtc_destroy_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_connector_dpms
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_check
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_connector_destroy_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_plane_duplicate_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_plane_reset
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_prepare_planes
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_helper_mode_fill_fb_struct
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_set_config
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_connector_duplicate_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_crtc_reset
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_kms_helper_hotplug_event
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_swap_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_page_flip
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_connector_reset
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_crtc_duplicate_state
depmod: WARNING: /lib/modules/4.5.0-gentoo-r1-x/video/nvidia-drm.ko needs unknown symbol drm_atomic_helper_update_plane
```

参考 [Unable to load kernel module for 364.12](https://devtalk.nvidia.com/default/topic/926967/unable-to-load-kernel-module-for-364-12/) 要支持`DRM_KMS_HELPER`，在内核编译选择时至少要选择一个显卡，以便能够激活显卡需要的`DRM_KMS_HELPER`。注意，不要编译`nouveau`模块，例如可以选择 Intel显卡编译成模块这样旧可以自动具备`DMA_KMS_HELPER`

* 启动时候显示启动参数后就没有响应，而以前使用开源`nouveau`驱动此时会切换字符终端的显示分辨率并启动

参考 [Apple Macbook Pro Retina 15-inch (early 2013)](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina_15-inch_(early_2013)) 

* 在内核参数中需要添加`nomodeset`
* 使用命令`nvidia-xconfig`和`nvidia-settings`来创建`xorg.conf`


如果使用开源驱动，建议同时编译配置Intel和Nouveau显卡驱动，即使你只准备使用其中之一。因为同时安装这两个驱动就可以使用`vga_switcheroo`来切换，并且可以通过关闭其中之一来节电。切换方法参考 [vga_switcheroo](http://archive.is/ofeBp)。

可以使用[Hprofile](https://wiki.gentoo.org/wiki/Hprofile)在Intel和Nouveau之间无缝切换，但是如果使用Nvidia闭源驱动，则要重启（kernel 3.14之后的内核）

# 参考

* [NVidia/nvidia-drivers](https://wiki.gentoo.org/wiki/NVidia/nvidia-drivers)
* [Apple Macbook Pro Retina 15-inch (early 2013)](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina_15-inch_(early_2013))
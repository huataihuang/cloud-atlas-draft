[Kata Containers](https://katacontainers.io/)是结合了 [Intel Clear Containers](https://github.com/clearcontainers/runtime) 和 [Hyper runV](https://github.com/hyperhq/runv) 两项开源技术而诞生轻量级虚拟机（lightweight Virtual Machines, VMs）。

kata containers提供了负载隔离和VMs的安全优点，同时执行性能类似容器。

> 有点类似近期接触过的[容器模式在Linux中安装和运行Android Apps(APKs)](../../develop/android/linux/install_and_run_android_apps_on_linux_in_container)中所介绍的[Anbox](https://github.com/anbox/anbox)（Anbox采用了Linux namespaces来提供Android系统容器，但是硬件访问通过anbox的daemon，实际是基于QEMU模拟）

这项结合了容器和QEMU的轻量级虚拟化技术目标是综合容器的性能和虚拟化的安全隔离，对于特定的应用目标有一定的优势。
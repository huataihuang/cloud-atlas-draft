
# 内核模块参数检查

## 使用脚本检查内核模块参数

内核模块参数位于 `/sys/module/<module_name>/parameters` 中，可以通过这个参数入口动态调整内核模块的特性。

如何打印出内核模块的参数值设置呢？参考

```bash
cat /proc/modules | cut -f 1 -d " " | while read module; do \
 echo "Module: $module"; \
 if [ -d "/sys/module/$module/parameters" ]; then \
  ls /sys/module/$module/parameters/ | while read parameter; do \
   echo -n "Parameter: $parameter --> "; \
   cat /sys/module/$module/parameters/$parameter; \
  done; \
 fi; \
 echo; \
done
```

上述脚本很好展示了内核模块参数当前值：

```
Module: tun

Module: ipt_MASQUERADE

Module: nf_nat_masquerade_ipv4
...
Module: nf_conntrack_ipv4
Parameter: hashsize --> 187500
...

Module: kvm_intel
Parameter: emulate_invalid_guest_state --> Y
Parameter: enable_apicv --> Y
Parameter: enable_shadow_vmcs --> Y
Parameter: ept --> Y
Parameter: eptad --> Y
Parameter: fasteoi --> Y
Parameter: flexpriority --> Y
Parameter: nested --> N
Parameter: ple_gap --> 128
Parameter: ple_window --> 4096
Parameter: ple_window_grow --> 2
Parameter: ple_window_max --> 1073741823
Parameter: ple_window_shrink --> 0
Parameter: pml --> Y
Parameter: unrestricted_guest --> Y
Parameter: vmm_exclusive --> Y
Parameter: vpid --> Y
```

## 使用`sysfsutils`软件包提供的工具`systool`

首先安装`sysfsutils`工具包

```
sudo yum install sysfsutils
```

然后执行`systool -vm <Module name>`来检查模块参数，例如检查`kvm_intel`模块

```bash
systool -vm kvm_intel
```

显示输出：

```bash
Module = "kvm_intel"

  Attributes:
    coresize            = "162153"
    initsize            = "0"
    initstate           = "live"
    refcnt              = "6"
    rhelversion         = "7.2"
    srcversion          = "A7365FEDDA6A1937D82B32F"
    taint               = ""
    uevent              = <store method only>

  Parameters:
    emulate_invalid_guest_state= "Y"
    enable_apicv        = "Y"
    enable_shadow_vmcs  = "Y"
    ept                 = "Y"
    eptad               = "Y"
    fasteoi             = "Y"
    flexpriority        = "Y"
    nested              = "N"
    ple_gap             = "128"
    ple_window_grow     = "2"
    ple_window_max      = "1073741823"
    ple_window_shrink   = "0"
    ple_window          = "4096"
    pml                 = "Y"
    unrestricted_guest  = "Y"
    vmm_exclusive       = "Y"
    vpid                = "Y"

  Sections:
    .bss                = "0xffffffffa041aa40"
    .data               = "0xffffffffa041a000"
    .data..read_mostly  = "0xffffffffa041a7e2"
    .data.unlikely      = "0xffffffffa041a7e0"
    .exit.text          = "0xffffffffa0408ca4"
    .fixup              = "0xffffffffa0406308"
    .gnu.linkonce.this_module= "0xffffffffa041a800"
    .init.text          = "0xffffffffa0255000"
    .note.gnu.build-id  = "0xffffffffa0409000"
    .parainstructions   = "0xffffffffa0417908"
    .rodata             = "0xffffffffa0409040"
    .rodata.str1.1      = "0xffffffffa0417ca4"
    .rodata.str1.8      = "0xffffffffa0417ee8"
    .smp_locks          = "0xffffffffa04188bc"
    .strtab             = "0xffffffffa02596a8"
    .symtab             = "0xffffffffa0256000"
    .text               = "0xffffffffa03f9000"
    .text.unlikely      = "0xffffffffa04081f5"
    __bug_table         = "0xffffffffa0418928"
    __ex_table          = "0xffffffffa0416fc0"
    __jump_table        = "0xffffffffa041a600"
    __mcount_loc        = "0xffffffffa0418b60"
    __param             = "0xffffffffa0418940"
```
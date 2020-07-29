ECS虚拟机启动中有关于MSR报错，可能和处理器idle有关，后续需要分析

```
[Sat Jun 20 23:42:04 2020] intel_idle: MWAIT substates: 0x2020
[Sat Jun 20 23:42:04 2020] intel_idle: v0.4.1 model 0x55
[Sat Jun 20 23:42:04 2020] tsc: Marking TSC unstable due to TSC halts in idle states deeper than C2
[Sat Jun 20 23:42:04 2020] unchecked MSR access error: RDMSR from 0x1fc at rIP: 0xffffffff9a861db3 (native_read_msr+0x3/0x30)
[Sat Jun 20 23:42:04 2020] Call Trace:
[Sat Jun 20 23:42:04 2020]  intel_idle_cpu_online+0x6c/0xf0
[Sat Jun 20 23:42:04 2020]  cpuhp_invoke_callback+0x8d/0x500
[Sat Jun 20 23:42:04 2020]  ? sort_range+0x20/0x20
[Sat Jun 20 23:42:04 2020]  cpuhp_thread_fun+0xcb/0x130
[Sat Jun 20 23:42:04 2020]  smpboot_thread_fn+0xc5/0x160
[Sat Jun 20 23:42:04 2020]  kthread+0x112/0x130
[Sat Jun 20 23:42:04 2020]  ? kthread_flush_work_fn+0x10/0x10
[Sat Jun 20 23:42:04 2020]  ret_from_fork+0x35/0x40
[Sat Jun 20 23:42:04 2020] unchecked MSR access error: WRMSR to 0x1fc (tried to write 0x0000000000000000) at rIP: 0xffffffff9a861f14 (native_write_msr+0x4/0x20)
[Sat Jun 20 23:42:04 2020] Call Trace:
[Sat Jun 20 23:42:04 2020]  intel_idle_cpu_online+0x83/0xf0
[Sat Jun 20 23:42:04 2020]  cpuhp_invoke_callback+0x8d/0x500
[Sat Jun 20 23:42:04 2020]  ? sort_range+0x20/0x20
[Sat Jun 20 23:42:04 2020]  cpuhp_thread_fun+0xcb/0x130
[Sat Jun 20 23:42:04 2020]  smpboot_thread_fn+0xc5/0x160
[Sat Jun 20 23:42:04 2020]  kthread+0x112/0x130
[Sat Jun 20 23:42:04 2020]  ? kthread_flush_work_fn+0x10/0x10
[Sat Jun 20 23:42:04 2020]  ret_from_fork+0x35/0x40
[Sat Jun 20 23:42:04 2020] intel_idle: lapic_timer_reliable_states 0x2
```

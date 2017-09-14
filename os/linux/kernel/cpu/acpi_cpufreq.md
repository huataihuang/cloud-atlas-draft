在一些使用旧版本电源管理驱动上，可能会使用`acpi-cpufreq`驱动，此时使用 `cpupower frequency-info`会显示如下：

```
$cpupower frequency-info
analyzing CPU 0:
  driver: acpi-cpufreq
  CPUs which run at the same hardware frequency: 0
  CPUs which need to have their frequency coordinated by software: 0
  maximum transition latency: 10.0 us.
  hardware limits: 1.20 GHz - 2.50 GHz
  available frequency steps: 2.50 GHz, 2.50 GHz, 2.40 GHz, 2.30 GHz, 2.20 GHz, 2.10 GHz, 2.00 GHz, 1.90 GHz, 1.80 GHz, 1.70 GHz, 1.60 GHz, 1.50 GHz, 1.40 GHz, 1.30 GHz, 1.20 GHz
  available cpufreq governors: conservative, userspace, powersave, ondemand, performance
  current policy: frequency should be within 2.50 GHz and 2.50 GHz.
                  The governor "powersave" may decide which speed to use
                  within this range.
  current CPU frequency is 2.50 GHz (asserted by call to hardware).
  boost state support:
    Supported: yes
    Active: yes
```
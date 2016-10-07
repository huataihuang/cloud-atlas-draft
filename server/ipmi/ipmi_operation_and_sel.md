> 在服务器维护中，通过OOB带外操作重启服务器，会在服务器的`sel`服务器事件日志中记录对应日志，例如

```
 2cf | 10/02/2016 | 11:18:16 | Unknown #0xcb |  | Asserted
 2d0 | 10/02/2016 | 11:18:29 | Unknown #0xcb |  | Asserted
 2d1 | 10/02/2016 | 11:18:32 | System ACPI Power State #0xc1 | S4/S5: soft-off | Asserted
 2d2 | 10/02/2016 | 11:20:15 | System ACPI Power State #0xc1 | S0/G0: working | Asserted
 2d3 | 10/02/2016 | 11:20:15 | Unknown #0xcb |  | Asserted
 2d4 | 10/02/2016 | 11:20:43 | System Boot Initiated #0xe0 | Initiated by power up | Asserted
 2d5 | 10/02/2016 | 11:23:01 | Unknown #0xcb |  | Asserted
 2d6 | 10/02/2016 | 11:23:27 | System Boot Initiated #0xe0 | Initiated by power up | Asserted
```

为方便理解，汇总整理常见操作的对应`sel`日志

| ipmitool指令 | sel对应日志 |
| ---- | ---- |
| `chassis power status` | 无记录 |
| `chassis power off` | `Unknown #0xcb` + `System ACPI Power State #0xc1 S4/S5: soft-off` |
| `chassis power on` | `System ACPI Power State #0xc1 S0/G0: working` + `Unknown #0xcb` + `System Boot Initiated #0xe0 Initiated by power up` |
| `chassis power reset` | `Unknown #0xcb` + `System Boot Initiated #0xe0 Initiated by power up` |

> OOB电源状态切换都会记录一条 `Unknown #0xcb`
>
> OOB关闭电源记录 `S4/S5: soft-off`
>
> OOB开启电源记录 `S0/G0: working`
>
> 电源开启关闭都记录ACPI状态变化 `System ACPI Power State #0xc1`
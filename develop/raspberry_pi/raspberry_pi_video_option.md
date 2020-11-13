在配置 [树莓派的USB存储](raspberry_pi_usb_problem) 有人提到过通过调整 USB-HDMI 来解决，我了解了一下如何调整树莓派的视频输出：

- 配置在 [config.txt](https://www.raspberrypi.org/documentation/configuration/config-txt/video.md) 设置

# HDMI模式

- 配置 `hdmi_safe=1` 是一种安全模式，提供了最大的HDMI兼容，相当于

```bash
hdmi_force_hotplug=1
hdmi_ignore_edid=0xa5000080
config_hdmi_boost=4
hdmi_group=2
hdmi_mode=4
disable_overscan=0
overscan_left=24
overscan_right=24
overscan_top=24
overscan_bottom=24
```

- 可以结合 HDMI groups 和 mode 来设置分辨率
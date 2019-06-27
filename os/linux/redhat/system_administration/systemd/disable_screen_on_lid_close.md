在设置了[合上笔记本屏幕不休眠](disable_suspend_when_close_laptop_lid)之后，你会发现此时笔记本的屏幕也继续工作者。对于旧款的MacBook，其笔记本A面的Logo会发出刺眼的白光，并且也造成能源的无谓消耗，更带来笔记本温度升高。

此时需要进一步设置关闭屏幕。

# 图形界面关闭屏幕

* 以root身份执行以下命令

```bash
# sudo su
echo 'event=button/lid.*' | tee --append /etc/acpi/events/lm_lid
echo 'action=/etc/acpi/lid.sh' | tee --append /etc/acpi/events/lm_lid
touch /etc/acpi/lid.sh
chmod +x /etc/acpi/lid.sh
```

* 然后编辑 `/etc/accpi/lid.sh` 脚本，并且将 `your_username` 替换成你的主用户名:

```bash
#!/bin/bash
 
USER=your_username
 
grep -q close /proc/acpi/button/lid/*/state
 
if [ $? = 0 ]; then
  su -c  "sleep 1 && xset -display :0.0 dpms force off" - $USER
fi
 
grep -q open /proc/acpi/button/lid/*/state
 
if [ $? = 0 ]; then
  su -c  "xset -display :0 dpms force on &> /tmp/screen.lid" - $USER
fi
```

> 注意：这里使用了 `xset` 来关闭屏幕，所以实际上要求进入图形界面操作，否则会提示 `xset:  unable to open display ":0.0"`

# 控制台关闭屏幕

关闭屏幕的简单命令如下:

```
sudo vbetool dpms off
```

建议采用如下方法，这样即使关闭屏幕，只要按下 `Enter` 键就能恢复

```
sudo sh -c 'vbetool dpms off; read ans; vbetool dpms on'
```

# 参考

* [Ubuntu 18.04 – Disable screen on lid close](https://mensfeld.pl/2018/08/ubuntu-18-04-disable-screen-on-lid-close/)
* [Turn off monitor using command line](https://askubuntu.com/questions/62858/turn-off-monitor-using-command-line)


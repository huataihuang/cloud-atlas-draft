在Android O系统中， `/system` 目录是只读的，要挂载成读写的方法如下：

```
adb root
adb disable-verity
adb reboot
adb remount
adb shell
mount -o rw,remount /system
```


# 参考

* [Android O, failed to mount /system, /dev/block/dm-0 is read only](https://android.stackexchange.com/questions/186630/android-o-failed-to-mount-system-dev-block-dm-0-is-read-only)
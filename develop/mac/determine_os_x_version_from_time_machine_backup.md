[从Time Machine备份中恢复Mac数据](restore_mac_from_time_machine)，我想知道恢复的操作系统是那个版本。例如，系统已经升级过多轮，我想恢复某个时期的旧版本操作系统。

检查方法参考 [Determining OS X version from Time Machine backup](https://apple.stackexchange.com/questions/175515/determining-os-x-version-from-time-machine-backup):

* 检查 `/Volumes/BackupVolumeName/BackupName.ext/ComputerName/latest/VolumeName/System/Library/CoreServices/SystemVersion.plist`

不过，如果你已经通过`recovery`模式启动主机或者使用安装光盘启动安装过程，在按章过程中选择`restore from time machine`，则会提供一个选择恢复哪个备份的步骤，在这个步骤中，是可以看到每个备份快照的版本的。这个方法非常简便。
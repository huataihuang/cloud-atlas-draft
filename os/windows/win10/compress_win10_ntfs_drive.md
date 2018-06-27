Windows 10支持NTFS驱动器的透明压缩功能，也就是整个驱动器都是压缩格式，写入文件自动压缩以节约磁盘空间。

但是在启用压缩功能时，会提示需要Administrator权限：

![压缩磁盘需要管理员权限](../../../img/os/windows/win10/compress_drive_need_admin_permission.png)

[How to enable the hidden Windows 10 administrator account](https://www.ghacks.net/2014/11/12/how-to-enable-the-hidden-windows-10-administrator-account/)

* 右击`Command Prompt`，然后选择 `run as administrator`
* 输入并运行以下命令

```
net user administrator /active:yes
```

* 如果要激活guest账号，可以执行

```
net user guest /active:yes
```

* 此时已经激活了administrator账号，也就是可以使用administrator账号登陆，但是默认没有密码
* 强烈建议使用密码保护 administrator 账号

```
net user administrator *
```

在激活了administrator账号之后，使用administrator账号登陆，然后就可以进行磁盘压缩功能。

# 修改用户账号类型方法（参考）

## 使用Settings设置修改用户账号类型

* 使用`Windows键+I`启动`Settings`功能
* 点击`Accounts`
* 点击`Family & other people`
* 在`Other people`中选择用户账号，然后点击`Change account type`

![修改账号类型](../../../img/os/windows/win10/user-accounts-settings-windows-10.jpg)

* 在账号类型中选择`Administrator`

![修改账号类型](../../../img/os/windows/win10/change-account-type-windows-10.jpg)

* 最后点击`OK`

## 使用Control Panel修改用户账号

* 使用`Windows键+X`启动`Control Panel`功能
...

# 参考

* [How to change a Windows 10 user account type and why](https://www.windowscentral.com/how-change-user-account-type-windows-10)
* [How to enable the hidden Windows 10 administrator account](https://www.ghacks.net/2014/11/12/how-to-enable-the-hidden-windows-10-administrator-account/)
* [How to Copy and Backup Files without Admin Rights?](https://www.easeus.com/todo-backup-resource/copy-and-backup-files-without-admin-rights.html)
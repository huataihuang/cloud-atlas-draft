# Windows 10安装OpenSSH

在Windows 10 版本1803及更高版本，操作系统直接提供了OpenSSH服务器软件，只需要激活就可以使用：

* 菜单 `Settings` => `Apps > Apps & features > Manage optional features`
* 选择`OpenSSH server`功能，并选择安装

二进制程序安装在`%WINDIR%\System32\OpenSSH`，配置文件 `sshd_config`和主机密钥安装在`%ProgramData%\ssh`（服务首次启动时生成）。

# 早期Winodows版本安装OpenSSH

* 下载[OpenSSH for Windows binaries](https://github.com/PowerShell/Win32-OpenSSH/releases)，如64位平台的`OpenSSH-Win64.zip`
* 作为管理员身份，将软件包解压缩到`C:\Program Files\OpenSSH`
* 作为管理员，安装`sshd`和`ssh-agent`服务

```
powershell.exe -ExecutionPolicy Bypass -File install-sshd.ps1
```

# 配置SSH服务

* 设置Windows防火墙允许SSH连接；

对于Windows 8以及2012或更新版本，以管理员身份执行命令：

```
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH SSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

或者在`Control Panel > System and Security > Windows Firewall1 > Advanced Settings > Inbound Rules`添加新到规则端口`22`

* 启动服务以及配置自动启动

在 `Control Panel > System and Security > Administrative Tools` 中启动`Serives`管理，找到`OpenSSH SSH Server`。

启动OpenSSH SSH Server服务，并设置启动类型为`Automatic`

# 登陆服务器

Windows的Open SSH Server的账号名是`administrator`，登陆密码即系统管理员密码。登陆后可以看到DOS提示符(假设主机名是`win-host`)：

```
administrator@win-host C:\Users\Administrator>
```

# 参考

* [Installing SFTP/SSH Server on Windows using OpenSSH](https://winscp.net/eng/docs/guide_windows_openssh_server)
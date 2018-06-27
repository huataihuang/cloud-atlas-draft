> 在远古时代，要在Windows上运行Open SSH服务是非常麻烦的事情，需要安装第三方的 [Cygwin](http://cygwin.com/) 软件包，设置也很繁琐。然而，随着微软拥抱开源技术，现在在Windows 2016和Windows 10平台，可以直接安装OpenSSH服务和客户端，给我们跨平台维护带来极大的便利。

注意：首先需要安装[PowerShell Core for Windows](https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell-core-on-windows?view=powershell-6#msi)

# 独立安装

[PowerShell/openssh-portable](https://github.com/PowerShell/openssh-portable)移植了开源的openssh版本，原文在[PowerShell Remoting Over SSH](https://docs.microsoft.com/en-us/powershell/scripting/core-powershell/ssh-remoting-in-powershell-core)，不过，由于`openssh-portable`已经替代了`Win32-OpenSSH`，所以现在在 [Install Win32 OpenSSH](https://github.com/PowerShell/Win32-OpenSSH/wiki/Install-Win32-OpenSSH) 介绍的安装方法实际安装的是openss-portable。

* 下载OpenSSH-Win64.zip

* 解压缩到`C:\Program Files\OpenSSH`目录，然后在这个目录下执行如下命令

```
powershell.exe -ExecutionPolicy Bypass -File install-sshd.ps1
```

此时会提示安装成功

![install ssh on windows](../../../img/os/windows/win2016install_ssh_success.png)

* 开启防火墙允许进入访问SSH

```
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

> 已上`New-NetFirewallRule`是Windows 2012及以上版本的服务器使用的。如果是客户桌面主机，如windows 10或windows 2008 r2，则尝试

```
netsh advfirewall firewall add rule name=sshd dir=in action=allow protocol=TCP localport=22
```

不过，这个防火墙设置我实际上没有设置成功，但是我实际访问已经是可以连接22端口了。

* 启动sshd

```
net start sshd
```

* 设置sshd和ssh-agent在操作系统启动时启动

```
Set-Service sshd -StartupType Automatic
Set-Service ssh-agent -StartupType Automatic
```

* 配置默认shell

在Windows注册表 `Computer\HKEY_LOCAL_MACHINE\SOFTWARE\OpenSSH\DefaultShell` 中有可以设置默认shell，以及`Computer\HKEY_LOCAL_MACHINE\SOFTWARE\OpenSSH\DefaultShellCommandOption`可以设置默认shell执行的命令并立即退出并返回调用的进程。这个功能可以用于执行远程ssh命令，例如 `ssh user@ip hostname`。

以下举例设置powershell作为默认shell

```
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -PropertyType String -Force

New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShellCommandOption -Value "/c" -PropertyType String -Force
```

上述设置已经完成了ssh on windows安装，不过，默认的Power shell对于Linux用户来说不太友好，可以尝试安装一个bash来作为远程维护。

> 不过，参考 [Windows Server Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install-on-server) 看起来只有Windows 10和Windows Server 2019才能够安装 Run Linux on Windows。

# 以下为记录（在Winodws 2016 DataCenter版本没有测试成功）

* 首先检查 Windows Server 2016 1709服务器上并没有安装OpenSSH

```
Get-WindowsCapability -Online | ? Name -like 'OpenSSH*'
```

* 安装客户端

```
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

* 安装服务器

```
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

* 使用客户端

```
Start-service ssh-agent
```

> 一旦安装，以下2个服务将安装在服务器上：
>
> * OpenSSH Client – SSH-Agent
> * OpenSSH Server – sshd

此时可以按看到如下安装的服务：

```
Get-service ssh*
```

要使得服务器服务工作，需要配置

```
Restart-server
```

* 配置服务器

```
cd C:\Windows\System32\OpenSSH

.\ssh-keygen -A

.\ssh-add ssh_host_ed25519_key

Install-Module -Force OpenSSHUtils
```

```
Repair-SshdHostKeyPermission -FilePath
```

```
Start-Service sshd
```

* 最后执行

```
Install-Module -Force OpenSSHUtils
```

```
Repair-SshdHostKeyPermission -FilePath C:\Windows\System32\OpenSSH\ssh_host_ed25519_key
```

* 开启防火墙允许ssh访问

```
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Service sshd -Enabled True -Direction Inbound -Protocol TCP -Action Allow -Profile Domain
```

# 参考

* [How To Install OpenSSH On Windows Server 2016 1709](https://www.ntweekly.com/2017/12/22/install-openssh-windows-server-2016-1709/)
* [PowerShell Remoting Over SSH](https://docs.microsoft.com/en-us/powershell/scripting/core-powershell/ssh-remoting-in-powershell-core?view=powershell-6)
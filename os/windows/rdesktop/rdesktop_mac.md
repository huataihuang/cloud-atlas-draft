Mac OS X操作系统上，微软提供了一个Microsoft Remote Desktop客户端，不过这个工具只在App Store美区提供（需要注册美区账号才能安装）。

# 结合Windows 2012使用Mac OS X版本Microsoft Remote Desktop客户端

* 服务器端启用"远程桌面" - "允许远程连接到此计算机"
* 如果远程桌面服务器没有部署在Active Directory认证的域环境中，则需要`关闭`"仅允许运行使用网络级别身份验证的远程桌面的计算机连接(建议)"

![非域认证远程桌面连接](/img/os/windows/rdesktop/rdesktop_no_domain.png)

* 默认情况下，Windows 2012的"高级安全Windows防火墙"只启用了"远程桌面"的"域, 专用"配置文件，而禁用了"公用"配置文件。所以如果没有使用域认证模式以及"专用"模式（？）则无法连接。如果可以放宽安全限制（如内网），则可以启用"远程桌面"的"公用"配置

![非域认证远程桌面连接](/img/os/windows/rdesktop/rdesktop_enable_public_connect.png)

![非域认证远程桌面连接](/img/os/windows/rdesktop/rdesktop_enable_public.png)
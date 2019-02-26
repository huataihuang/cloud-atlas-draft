 安装完Ubuntu，通常习惯都是将自己在安装过程中设置的个人账号 huatai 设置成sudo无需密码的切换。也就是修改 `/etc/sudoers` 配置文件，将自己所在的组修改成 `NOPASSWD:ALL`

 这次我添加了一行：

 ```
 %adm	ALL=(ALL:ALL) NOPASSWD:ALL
 ```

 但是，奇怪，我的`huatai`账号明明就是属于`adm`组，但是我发现上述配置并没有效果。我依然要每次输入密码之后才能切换到root账号。

 参考 [[Ubuntu]: sudoers NOPASSWD option not working](https://techglimpse.com/ubuntu-sudoers-nopasswd-option-not-working/) 原来`sudoers`配置文件生效有以下规则：

 * 如果有多个`/etc/sudoers`配置行匹配上用户账号，就会依次实施。这样，实际上最后一行生效。

 由于我的账号还同时属于 `sudo` 用户组，而在最后有一行有关`sudo`用户组是需要密码认证的

 ```
 %sudo	ALL=(ALL:ALL) ALL
 ```

 * 可以将自己定义的配置文件存放到 `/etc/sudoers.d/`目录下，这个目录下的配置文件最后生效。
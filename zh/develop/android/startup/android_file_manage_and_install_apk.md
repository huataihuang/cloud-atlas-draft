# 在Android中使用文件

Nexus原生Android系统，默认没有一个文件管理器。但是，并不意味着无法使用文件。

> 前述[使用Android File Transfer传输](transfer_file_to_android.md)文件到`Download`目录，但是打开`Downloads`程序却看不到这两个存放到`.apk`文件。

在`Settings => Storage & USB`设置中有一个`Explore`功能，就是一个文件管理器，可以浏览和使用文件。

> 发现一个比较反直觉的使用方法：原先[使用Android File Transfer传输](transfer_file_to_android.md)到`Download`目录下却在`Downloads`程序中看不到的`.apk`文件，如果在`Explore`中选择`.apk`文件，然后复制到`Downloads`中就可以看到。但是复制以后，在`Downloads`中看到的是`file_name(1).apk`文件，而在`Explore`中却是同时看到`file_name.apk`和`file_name(1).apk`两个文件。
>
> 其中，`Downloads`中可以使用`file_name(1).apk`进行安装，但是在`Explore`中，却不能对`file_name.apk`和`file_name(1).apk`进行安装。
>
> 似乎复制到`Downlaods`中是在`Download`中建立的副本，只有`Downloads`中显示的`.apk`文件才能执行安装

# 安装`Play Store`之外的app

> 注意：默认的安全策略是不允许安装`Play Store`之外的应用程序

要安装`Unknown sources`的应用程序，也就是自己开发或者第三方没有通过`Google Play Store`发布的程序，需要在 `Setting => Security` 设置激活`Unknown sources`


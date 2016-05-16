当前默认在Mac OS X上安装JAVA版本是最新的`1.8.0_66-b17`，但是也遇到有应用程序需要使用比较早期的JAVA版本。所以需要在Mac OS X上安装不同的JDK版本。

主要有两种方法：

* 使用[Homebrew](http://brew.sh/)管理多个java版本
* 卸载最新的JAVA，然后先安装低版本JAVA再安装高版本JAVA，通过`java_home`来切换不同的JAVA版本。

# 使用`java_home`切换JAVA版本

* 首先卸载系统中已经安装的最新版本的`1.8.0_66-b17`

> 在[Mac上卸载Java](https://www.java.com/en/download/help/mac_uninstall_java.xml) 需要执行以下步骤

在Terminal终端中执行以下命令

```bash
sudo rm -fr /Library/Internet\ Plug-Ins/JavaAppletPlugin.plugin
sudo rm -fr /Library/PreferencePanes/JavaControlPanel.prefpane
```

> 上述方法和[How can I uninstall Java on Mac (and reinstall Apple’s Java 6)?](http://techhelpkb.com/uninstall-java-on-mac/)中通过Finder找到`JavaAppletPlugin.plugin`进行删除是一样的效果。

上述命令只是删除了`plugin`和`System Perference`中的控制项，实际执行程序并没有删除。删除执行程序的方法参考[Removing Java 8 JDK from Mac](http://stackoverflow.com/questions/19039752/removing-java-8-jdk-from-mac)

```bash
sudo rm -rf /Library/Java/JavaVirtualMachines/jdk<version>.jdk
sudo rm -rf /Library/PreferencePanes/JavaControlPanel.prefPane
sudo rm -rf /Library/Internet\ Plug-Ins/JavaAppletPlugin.plugin
sudo rm -rf /Library/LaunchAgents/com.oracle.java.Java-Updater.plist
sudo rm -rf /Library/PrivilegedHelperTools/com.oracle.java.JavaUpdateHelper
sudo rm -rf /Library/LaunchDaemons/com.oracle.java.JavaUpdateHelper.plist
sudo rm -rf /Library/Preferences/com.oracle.java.Helper-Tool.plist
```

> 上述方法删除彻底，此时再执行`java -version`时，OS X会引导去Oracled Java安装的下载网站（已经不再提供Java 6的下载）

* 安装Java版本`1.7.0_80-b15`，安装完成后执行`java -version`可以看到当前版本是`1.7.0_80-b15`

* 再次安装Java版本`1.8.0_66-b17`

* 安装完成后执行`java -version`可以看到版本现在切换到了`1.8.0_66-b17`。不过，此时系统中实际已经安装了2个版本的JDK，下面我们要设置多版本切换。

* 检查当前系统安装的Java版本

```bash
/usr/libexec/java_home -verbose
```

可以看到输出有两个版本

```bash
Matching Java Virtual Machines (2):
    1.8.0_66, x86_64:	"Java SE 8"	/Library/Java/JavaVirtualMachines/jdk1.8.0_66.jdk/Contents/Home
    1.7.0_80, x86_64:	"Java SE 7"	/Library/Java/JavaVirtualMachines/jdk1.7.0_80.jdk/Contents/Home

/Library/Java/JavaVirtualMachines/jdk1.8.0_66.jdk/Contents/Home
```

* 设置终端中通过`java7`命令和`java8`命令来切换环境（[Mac OS X and multiple Java versions](
/Library/Java/JavaVirtualMachines/jdk1.8.0_66.jdk/Contents/Home)）

在`~/.bash_profile`中添加设置

```bash
export JAVA_8_HOME=$(/usr/libexec/java_home -v1.8)
export JAVA_7_HOME=$(/usr/libexec/java_home -v1.7)

alias java7='export JAVA_HOME=$JAVA_7_HOME'
alias java8='export JAVA_HOME=$JAVA_8_HOME'

#default java8
export JAVA_HOME=$JAVA_8_HOME
```

然后就可以通过命令`java7`或者`java8`来切换环境，切换环境后，再在终端中执行`java`命令就会对应使用指定的Java版本。

> 通过`java_home`方法可以切换终端中执行的java版本，但是无法影响图形应用程序执行的java版本。

# 使用`homebrew`管理java多版本

> **未实践** 记录供参考 [Mac OS X and multiple Java versions](http://stackoverflow.com/questions/26252591/mac-os-x-and-multiple-java-versions)

* 安装[homebrew](http://brew.sh)

```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

* 安装homebrew `jenv`

```bash
brew install jenv
```

* 安装 `homebrew-cask`

```bash
brew install homebrew-cask
```

* 查看当前版本

```bash
brew cask search java
```

* 安装需要的java版本

```bash
brew cask install java7
brew cask install java6
```

* 使用`jenv`管理版本

```bash
jenv add /Library/Java/JavaVirtualMachines/jdk1.7.0_80.jdk/Contents/Home
```

> 使用`/usr/libexec/java_home -verbose`来检查系统安装的JDK版本

# 参考

* [Multiple Versions of Java on OS X Mavericks](https://dzone.com/articles/multiple-versions-java-os-x) 这个文档提供了在终端中切换Java的方法（但是不影响图形界面运行java程序）
* 图形界面运行java程序指定java版本需要一些hack - [* [Multiple Versions of Java on OS X Mavericks](https://dzone.com/articles/multiple-versions-java-os-x)](http://stackoverflow.com/questions/17885494/how-can-i-change-mac-oss-default-java-vm-returned-from-usr-libexec-java-home) 不过我没有实践成功（没有理解方法）

* 卸载Java on Mac的方法：
  * [How can I uninstall Java on Mac (and reinstall Apple’s Java 6)?](http://techhelpkb.com/uninstall-java-on-mac/)
  * 官方文档[How do I uninstall Java on my Mac?](https://www.java.com/en/download/help/mac_uninstall_java.xml)
  * 完整的删除方法[Removing Java 8 JDK from Mac](http://stackoverflow.com/questions/19039752/removing-java-8-jdk-from-mac)
* [Mac OS X and multiple Java versions](http://stackoverflow.com/questions/26252591/mac-os-x-and-multiple-java-versions)
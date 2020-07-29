# 安装groovy

## 下载软件zip包安装

从 [groovy官网](http://www.groovy-lang.org/) 下载 [apache-groovy-sdk-3.0.5.zip](https://dl.bintray.com/groovy/maven/apache-groovy-binary-3.0.5.zip) 安装方法参考 [Install Groovy](http://groovy-lang.org/install.html)

```bash
unzip apache-groovy-sdk-3.0.5.zip -d /usr/local
```

上述指定解压缩目录到 `/usr/local` 下，就可以通过 `/usr/local/bin/groovy` 来使用了。

> Groovy 3.0运行需要Java 6+到Java 8，目前在Java 9 snapshots上运行还有一些问题。建议使用Java 8。[macOS上使用多个JDK版本](https://cloud-atlas.readthedocs.io/zh_CN/latest/macos_ios/studio/multi_jdk_on_macos.html)

> 如果想要将Groovy嵌入到应用程序，需要使用合适的 maven repositories或者 [JCenter maven repository](https://oss.jfrog.org/oss-release-local/org/codehaus/groovy)

例如在maven配置中添加:

```xml
<groupId>org.codehaus.groovy</groupId> 
<artifactId>groovy</artifactId>  
<version>3.0.5</version>
```

如果是使用gradle构建，则添加

```
'org.codehaus.groovy:groovy:3.0.5'
```

## 通过SDKMAN!安装

* 更为简单的安装方法是使用脚本安装

```bash
curl -s get.sdkman.io | bash
```

* 然后开启一个新的终端，或者输入命令:

```bash
source "/Users/huatai/.sdkman/bin/sdkman-init.sh"
```

* 最后执行以下命令安装最新的stable Groovy:

```bash
sdk install groovy
```

> 通过 SDKMAN!安装不需要root权限，安装以后执行程序位于 `/Users/huatai/.sdkman/candidates/groovy/current/bin/groovy`

# 运行groovy

通过运行一些简单的脚本或者交互ide来验证groovy安装是否成功。

* 启动groovy shell:

```bash
groovysh
```

* 或者启动一个groovyConsole图形交互控制台：

```bash
groovyConsole
```

* 或者执行任何Groovy脚本：

```bash
groovy SomeScript
```
# 安装Node.js

从Fedora 24开始，npm作为Node.js包的一部分，不再需要单独安装

```
sudo dnf install nodejs
```

以上命令将安装V8 Javascript引擎，Node.js runtime以及npm包管理器和依赖。通常安装当前版本或者Node.js LTS版本。

如果需要安装 Node.js v4:

```
sudo dnf install nodejs --releasever=24
```

如果需要安装 Node.js v6:

```
sudo dnf install nodejs --releasever=25
```

# Node.js模块

* 通过dnf安装模块

```
sudo dnf install nodejs-<module-name>
```

也可以使用类似以下命令

```
sudo dnf install 'npm(module-name)'
```

举例，安装`express`:

```
sudo dnf install nodejs-express
```

或者使用

```
sudo dnf install 'npm(express)'
```

## 通过npm安装模块

在Fedora中，不建议直接使用`npm`安装模块，因为会导致依赖问题。如果需要使用`npm`安装模块，建议本地安装。

# 通过dnf使用安装的模块

npm允许使用`require()`来仅仅使用本地安装模块。如果你希望通过dnf安装使用`require()`模块，在项目目录下执行以下命令：

```
npm link express
```

或者默认全局加载模块，设置`RNODE_PATH`如下：

```
export NODE_PATH=/usr/lib/node_modules
```

# 参考

* [Fedora Node.js](https://developer.fedoraproject.org/tech/languages/nodejs/nodejs.html)
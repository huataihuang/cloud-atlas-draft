# 安装Go

* 安装Go语言工具

```
sudo dnf install golang
```

* 设置环境

Go代码使用`GOPATH`环境变量来定义工作空间，设置一个默认的`GOPAHT`:

```
mkdir -p $HOME/go
echo 'export GOPATH=$HOME/go' >> $HOME/.bashrc
source $HOME/.bashrc
```

或者在`~/.bash_profile`中添加

```
GOPATH=$HOME/go
export GOPATH
```

# 测试go

```
mkdir -p $HOME/go/src/hello
cd $HOME/go/src/hello
touch hello.go
```

* 编辑`hello.go`

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, Fedora!")
}
```

* 运行以下命令编译和运行这个测试程序：

```
go run hello.go
```

这个`go run`命令会编译和运行Go程序，是一个快速验证的方法。

* 要编译程序并生成编译过的可执行程序，使用`go build`指令：

```
go build
```

当没有任何参数，`go build`就会在当前目录编译包，此时在当前目录下会生成`hello`可执行文件。

要测试则使用如下命令

```
./hello
```

* 另外一个有用的选项是`go install`，此时你会发现原先在当前目录下编译生成的二进制程序`hello`不见了，原来这个程序被安装到`$GOPATH/bin`目录下了：

```
go install
```

```
$ ls
hello.go
$ ls $GOPATH/bin
hello
```

使用`go install`不仅将编译后的可执行程序放到了`$GOPATH/bin`目录下，并且还把所有依赖都编译和缓存到`$GOPATH/pkg`目录，对于大型程序非常有用。所以`go install`因为使用了缓存会比`go build`快很多。

由于所有编译后程序被安装到`$GOPATH/bin`，所以建议在环境变量中添加这个路径：

```
echo 'export PATH=$PATH:$GOPATH/bin' >> $HOME/.bashrc
```

或者在`~/.bash_profile`中添加

```
PATH=$PATH:$GOPATH/bin
export PATH
```

# 安装Go包

可以通过`go get`命令获取上游包，包名的路径通过GitHub获取导入路径：

```
go get github.com/gorilla/context
```

如果需要的软件包有可执行代码，就会安装到`$GOPATH/bin`目录（见前述设置环境变量 `$GOPATH`）

## 从Fedora获取Go包

也可以安装从Fedora获取Go包，但是需要注意包的名字和直接通过上述GitHub导入的上游包名字不同。例如`code.google.com/p/go.net`在Fedora中名字为`golang-googlecode-net-devel`

```
sudo dnf install golang-googlecode-net-devel
```

# 参考

* [Go on Fedora](https://developer.fedoraproject.org/tech/languages/go/go-installation.html)
* [Writing Go programs](https://developer.fedoraproject.org/tech/languages/go/go-programs.html)
* [Go packages installation](https://developer.fedoraproject.org/tech/languages/go/go-packages.html)
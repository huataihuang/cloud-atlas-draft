# 在macOS上安装Go

从官方下载[macOS package installer](https://golang.org/dl/)安装后Go软件包位于`/usr/local/go`，并且把`/usr/local/go/bin`目录添加到用户的`PATH`环境变量。

* 测试安装

在工作目录下创建一个`src/hello`目录，并且在该目录下创建一个文件`hello.go`：

```go
package main

import "fmt"

func main() {
	fmt.Printf("hello, world\n")
}
```

然后编译：

```bash
cd $HOME/go/src/hello
go build
```

编译成功后尝试运行

```bash
$ ./hello
hello, world
```

# Go Playground

Go Playground 可以在浏览器中运行Go语言代码 http://play.golang.org


[stretchr/testify](https://github.com/stretchr/testify)是一个公用的断言（assertions)和模拟（mocks）的标准库。常用于模拟测试工作。

* 安装

```
go get github.com/stretchr/testify
```

安装后包位于 `~/go/src` 目录下，则go代码可以直接import

```
github.com/stretchr/testify/assert
github.com/stretchr/testify/require
github.com/stretchr/testify/mock
github.com/stretchr/testify/suite
github.com/stretchr/testify/http (deprecated)
```

举例：

```go
package yours

import (
  "testing"
  "github.com/stretchr/testify/assert"
)

func TestSomething(t *testing.T) {

  assert.True(t, true, "True is true!")

}
```
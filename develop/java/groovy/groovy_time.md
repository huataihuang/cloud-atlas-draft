groovy要格式化获取日期，一些案例。

* 当前日期格式化，以及求一定日期以后的日期

```groovy
import groovy.time.TimeCategory

def acceptedFormat = "yyyy-MM-dd"
def today = new Date()
def currentdate = today.format(acceptedFormat)

use(TimeCategory) {
    def oneYear = today + 1.year
    println oneYear

    def ninetyDays = today + 90.days
    println ninetyDays
}
```

* 日期格式化确实非常简单，先 `new Date()` ，然后使用 `new SimpleDateFormat` 使用JDK的方法

```groovy
import java.text.SimpleDateFormat
def date = new Date()
def sdf = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss")
println sdf.format(date)
```

在JRE 8中可以使用 `LocalDateTime` :

```groovy
import java.time.*

LocalDateTime t = LocalDateTime.now();
return t as String
```

# 参考

* [how to add year or months from current date in groovy?](https://stackoverflow.com/questions/31707460/how-to-add-year-or-months-from-current-date-in-groovy)
* [get current date and time in groovy?](https://stackoverflow.com/questions/39360085/get-current-date-and-time-in-groovy)
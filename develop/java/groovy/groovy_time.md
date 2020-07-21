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

# 参考

* [how to add year or months from current date in groovy?](https://stackoverflow.com/questions/31707460/how-to-add-year-or-months-from-current-date-in-groovy)
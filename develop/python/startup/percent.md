python内置了百分比的格式

```
>>> float(1) / float(3)
[Out] 0.33333333333333331

>>> 1.0/3.0
[Out] 0.33333333333333331

>>> '{0:.0%}'.format(1.0/3.0) # use string formatting to specify precision
[Out] '33%'

>>> '{percent:.2%}'.format(percent=1.0/3.0)
[Out] '33.33%'
```

> 参考 [how to show Percentage in python](http://stackoverflow.com/questions/5306756/how-to-show-percentage-in-python)
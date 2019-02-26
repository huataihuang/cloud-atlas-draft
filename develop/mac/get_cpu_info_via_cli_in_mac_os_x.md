使用`sysctl`可以检查CPU信息

```
sysctl -n machdep.cpu.brand_string
```

例如，macOS在2018 mid版本MacBook Pro中输出信息显示

```
Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz
```

通过`system_profiler`也可以获得详细信息：

```
system_profiler | grep Processor
```

输出显示

```
    Apple: AUDynamicsProcessor:
    IOSlaveProcessor:
      Bundle ID: com.apple.driver.IOSlaveProcessor
      Location: /System/Library/Extensions/IOSlaveProcessor.kext
      Processor Name: Intel Core i7
      Processor Speed: 2.2 GHz
      Number of Processors: 1
```

# 参考

* [Get CPU Info via Command Line in Mac OS X](http://osxdaily.com/2011/07/15/get-cpu-info-via-command-line-in-mac-os-x/)
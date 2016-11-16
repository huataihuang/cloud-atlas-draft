在解决[python多层嵌套字典KeyError](nested_dictionary_key_error)时候，我使用了 `lambda`的方法来构建一个复杂的嵌套字典，能够正常运行，但是在使用Python开发IDC（使用sublime+SimplePythonIDC）发现在以下这段代码第一行

```
mydict = lambda: defaultdict(mydict)
vm_perf = mydict()
```


有如下提示信息：

```
[W] PEP 8(E731): do not assign a lambda expression, use a def, 3 matches
```

# 参考
在使用`pip install pymysql`的时候意外遇到链接https报错

```
Collecting pymsql
/home/admin/venv2/lib/python2.7/site-packages/pip/_vendor/requests/packages/urllib3/util/ssl_.py:318: SNIMissingWarning: An HTTPS request has been made, but the SNI (Subject Name Indication) extension to TLS is not available on this platform. This may cause the server to present an incorrect TLS certificate, which can cause validation failures. You can upgrade to a newer version of Python to solve this. For more information, see https://urllib3.readthedocs.io/en/latest/security.html#snimissingwarning.
  SNIMissingWarning
  Could not find a version that satisfies the requirement pymsql (from versions: )
No matching distribution found for pymsql
```

上述 SNIMissingWarning 是因为使用的Python版本低于2.7.9导致的。不过，我使用的 2.7.14 也遇到这问题：

规避的方法是：

```python
>>> import urllib3
>>> urllib3.disable_warnings()
```

> 另外，我搞错了，`pymysql`安装方法是：

```
pip install PyMySQL
```

> 参考 [PyMySQL](https://github.com/PyMySQL/PyMySQL)
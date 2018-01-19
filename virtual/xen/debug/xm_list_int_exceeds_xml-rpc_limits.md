在xen服务器上执行`xm list`指令出现如下报错：

```
$sudo xm list
Error: int exceeds XML-RPC limits
Usage: xm list [options] [Domain, ...]

List information about all/some domains.
  -l, --long                     Output all VM details in SXP               
  --label                        Include security labels                    
  --state=<state>                Select only VMs with the specified state   
  --nohide                       Include the hiden domains
```

参考 [Re: Xen API connection with python and xml-rpc int limit](https://lists.gt.net/xen/api/266575)

`/usr/lib64/python2.4/xmlrpclib.py`中有如下判断int类型范围：

```python
    def dump_int(self, value, write):
        # in case ints are > 32 bits
        if value > MAXINT or value < MININT:
            raise OverflowError, "int exceeds XML-RPC limits"
```

经过检查，发现是host主机上虚拟机数量太多导致，通过热迁移部分vm来规避。
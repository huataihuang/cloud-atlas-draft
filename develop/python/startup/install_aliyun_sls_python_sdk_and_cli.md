阿里云的SLS日志服务提供了Python SDK，并提供了aliyun-sls-cli客户端，非常容易安装使用。

SLS的命令行工具(Command Line Interface - CLI) 支持几乎所有操作，日志查询支持完整性检查与自动分页、支持多账户与跨域复制。

# 安装

* 我使用Python virtualenv 来运行python程序，使用以下命令安装日志服务器CLI

```bash
pip3 install aliyun-log-python-sdk aliyun-log-cli -U --no-cache
```

对于需要大量下载和传输数据的命令，例如 `copy_data` `pull_log_dump` ，建议使用 `pypy` 或 `pypy3` 来安装，可以获得更好的性能。

* 创建 ``aliyunlog`` 文件，并设置可执行，放到PATH目录下:

```python
#!/Users/huatai/venv3/bin/python
import re
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(
        load_entry_point('aliyun-log-cli', 'console_scripts', 'aliyunlog')()
    )
```

# 参考

- [Aliyun Log Service CLI 用户手册](https://aliyun-log-cli.readthedocs.io/en/latest/README_CN.html)

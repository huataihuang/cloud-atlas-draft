`qcloudapi-sdk-python` 是为了让 Python 开发者能够在自己的代码里更快捷方便的使用腾讯云的 API 而开发的 SDK 工具包。

> 安装Python环境参考[PerfKit Benchmaker快速起步](../../../performance/cloud/perfkit_benchmarker/quick_start)

# 安装

> 通过pip安装最为方便简洁，本文实践在[PerfKit Benchmaker快速起步](../../../performance/cloud/perfkit_benchmarker/quick_start)环境基础上完成

```
pip install qcloudapi-sdk-python
```

# 申请安全凭证

第一次使用云API之前，用户首先需要在腾讯云网站上申请[安全凭证](https://console.qcloud.com/capi)，安全凭证包括 SecretId 和 SecretKey, SecretId 是用于标识 API 调用者的身份，SecretKey是用于加密签名字符串和服务器端验证签名字符串的密钥。SecretKey 必须严格保管，避免泄露。

# 使用

* 列出指定区域（这里案例是`成都`区域）的cvm实例

```python
>>> from QcloudApi.qcloudapi import QcloudApi
>>> module = 'cvm'
>>> action = 'DescribeInstances'
>>> config = {'Region':'ap-guangzhou', 'secretId':'xxxx', 'secretKey':'xxxx', 'Version':'2017-03-20'}
>>> params = {'Limit':1}
>>> service = QcloudApi(module, config)
>>> service.call(action, params)
```

> * `Version` 表示API版本号，主要用于标识请求的不同API版本。 本接口第一版本可传：2017-03-12。

* 启动实例

```python
>>> from QcloudApi.qcloudapi import QcloudApi
>>> module = 'cvm'
>>> action = 'StartInstances'
>>> config = {'Region':'ap-guangzhou', 'secretId':'xxxx', 'secretKey':'xxxx', 'Version':'2017-03-20'}
>>> params = {'InstanceIds.1':'ins-2vo6qtql', 'Version':'2017-03-20'}
>>> service.call(action, params)
'{"Response":{"RequestId":"e3023a10-33ef-4aac-8fe4-7b296a151178"}}'
```

> * `InstanceIds.N` 一个或多个待操作的实例ID。可通过DescribeInstances接口返回值中的InstanceId获取。每次请求批量实例的上限为100。

> 参考文档：[启动实例](https://cloud.tencent.com/document/api/213/9386)

## `cvm`常用`action`

```

```

# 代码案例

# 参考

* [云API SDK  Python](https://cloud.tencent.com/document/developer-resource/494/7244)
* [GigHub: qcloudapi-sdk-python](https://github.com/QcloudApi/qcloudapi-sdk-python)
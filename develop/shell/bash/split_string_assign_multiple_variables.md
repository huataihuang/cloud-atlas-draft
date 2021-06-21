很多时候，需要将一行字符分割成多个变量，例如处理文本

这里需要注意，默认分割符是空格，如果是不同分割符，则需要设置 `IFS`

```bash
IFS="," read -r v_space v_email v_name v_sn <<< ",myname@example.com,不一样的烟火,123456"
```

然后我们就可以随便使用变量了

```bash
echo $v_name
```

显示输出

```
不一样的烟火
```

# json和多变量案例

我在结合上述方法，采用循环方式根据 `app` 名字访问API来获得应用的配置(json)。

例如，单条命令

```bash
app=ABC
AK=XXXXXXXX

curl -s --location --request GET "http://api.example.com/getAppInfo.json?appName=$app" --header "apiauth-token: $AK" | jq
```

可以获得某个应用的信息如下

```json
{
  "app": {
    ...
    "owner": {
      ...
      "email": "xyz@example.com",
      "nickName": "dogfood",
      "staffNo": "123",
      ...
    },
...
```

则我通过jq多变量读取：

```bash
curl -s --location --request GET "http://api.example.com/getAppInfo.json?appName=$app" --header "apiauth-token: $AK" | jq -r '.app.owner | .email + "," + .nickName + "," + .staffNo'
```

可以输出

```
xyz@example.com,dogfood,123
```

* 然后我们可以通过多变量赋值直接读取到3个变量，方便后续shell处理

```bash
IFS="," read -r owner_email owner_nickName onwer_staffNo <<< $(curl -s --location --request GET "http://api.example.com/getAppInfo.json?appName=$app" --header "apiauth-token: $AK" | jq -r '.app.owner | .email + "," + .nickName + "," + .staffNo')
```

不过，上述采用 `$()` 来把执行结果转换为字符串变量然后通过 `<<<` 输入给左边3个变量的方法，如果使用了循环，则只能在高版本bash上正常工作(例如bash 4.4.19):

```bash
for app in `cat $APP_LIST`; do
  IFS="," read -r owner_email owner_nickName onwer_staffNo <<< $(curl -s --location --request GET "http://api.example.com/getAppInfo.json?appName=$app" --header "apiauth-token: $AK" | jq -r '.app.owner | .email + "," + .nickName + "," + .staffNo')

  echo "owner_nickName: $owner_email"
  echo "owner_email: $owner_nickName"
  echo "onwer_staffNo: $onwer_staffNo"
done
```

则在 macOS的bash 3.2.57上执行结果是错误的

```
owner_email: xyz@example.com dogfood 123
owner_nickName:
onwer_staffNo: 
...
```

但是，如果运行环境是高版本 bash 4.4.19 (linux)，则完全正常

```
owner_email: xyz@example.com
owner_nickName: dogfood
onwer_staffNo: 123
...
```

为了兼容低版本bash，脚本需要修订成 `<<<` 右边直接使用字符串变量 `"$string"` :

```bash
for app in `cat $APP_LIST`; do
  AppInfo=`curl -s --location --request GET "http://api.example.com/getAppInfo.json?appName=$app" --header "apiauth-token: $AK" | jq -r '.app.owner | .email + "," + .nickName + "," + .staffNo'`
  IFS="," read -r owner_email owner_nickName onwer_staffNo <<< "$AppInfo"
done
```

则通用能够正常工作输出正确结果

# 参考

* [Bash: How to split a string and assign multiple variables](https://stackoverflow.com/questions/33320584/bash-how-to-split-a-string-and-assign-multiple-variables)
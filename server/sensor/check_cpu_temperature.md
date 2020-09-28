Linux服务器运维时非常重要的一项监控就是服务器内部温度监控。当出现服务器内部温度过高，例如风扇故障，就会导致CPU因温度过高降频，甚至出现死机或者其他数据异常现象。

在Linux中，软件包 `lm_sensors` (即Linux-monitoring sensors)提供了基础工具和驱动来监控CPU温度，电压，湿度和风扇。同时也提供了主板入侵检测(非授权开启机箱)。通过该工具结合监控软件，可以用来发现硬件异常，及时更换受损部件。

# 安装lm_sensors

- Arch linux安装:

```
sudo pacman -S lm_sensors
```

- RHEL/CentOS,Fedora:

```
sudo yum install lm_sensors
```

- Debian, Ubuntu:

```
sudo apt install lm_sensors
```

- SUSE/openSUSE:

```
sudo zypper in sensors
```

# 配置lm_sensors

安装以后，运行以下命令配置 lm_sensors

```
sudo sensors-detect
```

`sensors-detect` 是一个独立程序用来检测已经安装的硬件以及加载推荐的特定模块。默认的交互回答就是安全的，所以只需要回车接受默认配置就可以。此时会生产一个 `/etc/conf.d/lm_sensors` 配置文件用于 `lm_sensors.service` 服务自动在启动时加载模块。

# 查看CPU温度

- 简单执行以下命令就可以查看Linux:

```
sensors
```

默认输出的单位是摄氏度，要输出为华氏度，则使用参数 `-f`

- 为了持续查看温度变化(以下案例每2秒刷新一次)，可以使用命令:

```
wtach -n 2 sensors
```

# 硬盘温度

如果要监控硬盘温度，可以安装 `hddtemp` 工具:

```
sudo apt install hddtemp
```

# 图形界面

安装 `psensor` 工具可以以图形界面方式观察温度:

```
sudo apt install psensor
```

# glances

Glances是一个使用Python编写的跨平台系统监控工具，我最早接触这个工具还是在十几年前给电信维护HP小型机时，在远程终端上使用这个超级工具glances。

- 安装:

```
sudo apt -y --force-yes update
sudo pip install --upgrade pip
wget -O- https://bit.ly/glances | /bin/bash
```

也可以通过仓库安装

```
sudo apt-add-repository ppa:arnaud-hartmann/glances-stable
sudo apt-get update
sudo apt-get install glances
```

# hardinfo

hardinfo是一个系统分析和性能评测工具，可以获得硬件和基本软件信息，并且使用GUI组织这些信息。

大多数硬件可以通过hardinfo自动检测，也有部分硬件需要手工设置：

- lm-sensors: 需要如上使用 `sensors-detect` 先检测需要加载哪些内核模块
- hddtemp:  需要以daemon模式运行hddtemp并且使用默认端口，这样hardinfo就可以使用hddtemp
- 模块 `eeprom` 必须加载用于显示当前安装的内存信息，所以需要先使用 `modprobe eeprom` 加载并刷新

# 参考

- [How To View CPU Temperature On Linux](https://ostechnix.com/view-cpu-temperature-linux/)
- [How To Check CPU Temperature in Ubuntu Linux](https://itsfoss.com/check-laptop-cpu-temperature-ubuntu/)
- [How To Check CPU Temperature In Ubuntu Linux](https://sourcedigit.com/25105-check-cpu-temperature-ubuntu-linux/)
- [How to check CPU temperature on Linux](https://www.addictivetips.com/ubuntu-linux-tips/check-cpu-temperature-on-linux/)

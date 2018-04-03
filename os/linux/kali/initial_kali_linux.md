> 默认安装Kali Linux是一个mini安装，需要安装一些必要的工具软件方便使用，本文是一些实践记录。

* 安装工具软件

```
apt install screen curl sysstat unzip mlocate dnsutils
```

# Kali Linux软件组合

Kali Linux提供了多种`metapackages`来听过抑郁安装的工具子集。可以通过以下命令来检查有哪些工具集合：

```
apt-get update && apt-cache search kali-linux
```

可以看到提供了以下工具组合：

```
kali-linux - Kali Linux base system
kali-linux-all - Kali Linux - all packages
kali-linux-forensic - Kali Linux forensic tools
kali-linux-full - Kali Linux complete system
kali-linux-gpu - Kali Linux GPU tools
kali-linux-nethunter - Kali Linux Nethunter tools
kali-linux-pwtools - Kali Linux password cracking tools
kali-linux-rfid - Kali Linux RFID tools
kali-linux-sdr - Kali Linux SDR tools
kali-linux-top10 - Kali Linux Top 10 tools
kali-linux-voip - Kali Linux VoIP tools
kali-linux-web - Kali Linux webapp assessment tools
kali-linux-wireless - Kali Linux wireless tools
```

# 参考

* [Kali Linux Metapackages](https://www.kali.org/news/kali-linux-metapackages/)
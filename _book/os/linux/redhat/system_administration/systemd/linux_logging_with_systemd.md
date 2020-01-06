# Journald配置

`systemd-journald`主要配置是 `/etc/systemd/journald.conf` ，不过，其他软件包可能会在以下目录中创建任何以`.conf`文件扩展名的配置文件：

```
/ETC/SYSTEMD/JOURNALD.CONF.D/*.CONF
/RUN/SYSTEMD/JOURNALD.CONF.D/*.CONF
/USR/LIB/SYSTEMD/JOURNALD.CONF.D/*.CONF
```

# 参考

* [Linux Logging with Systemd](https://www.loggly.com/ultimate-guide/linux-logging-with-systemd/)
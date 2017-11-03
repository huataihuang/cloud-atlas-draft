Django作为WEB开发框架，默认使用SQLite作为开发数据库。生产环境，则通常需要使用MySQL或者PostgreSQL。这里介绍在CentOS上部署完MySQL和Python+Django环境之后，如何转换到MySQL后端。

> Django使用mysql后端需要通过`pip`安装`mysqlclient`模块，这个编译安装过程依赖系统安装`mysql-devel`软件包。对于早期的CentOS 5，建议采用MySQL官方软件仓库在[CentOS 5安装MySQL 5.7](../../../../database/mysql/install_and_upgrade/install_mysql5.7_in_centos_5)
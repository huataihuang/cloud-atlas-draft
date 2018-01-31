Linux已经发展成从手机到服务器，从穿戴设备到超级计算机，无比强大且极具伸缩性的操作系统。这也是最具可玩性的OS系统，开源并且具备旺盛的生命力。

Linux的历史和自由软件和开源软件息息相关，如果你想真正了解什么是自由，什么是开源，以及对学习Linux有浓厚的兴趣，推荐阅读：

* [大教堂与集市](http://hifor.net/ebook/%E8%AE%A1%E7%AE%97%E6%9C%BA%E6%96%87%E5%8C%96/%E5%A4%A7%E6%95%99%E5%A0%82%E4%B8%8E%E9%9B%86%E5%B8%82/)
* [开源世界旅行手册](https://i.linuxtoy.org/docs/guide/index.html)
* [大话x window、GNOME、KDE的前世今生](https://cainiaoqidian.com/post/315.html) - 为什么现在Linux桌面会有两个主流的KDE和Gnome系统

# Linux发行版

如何选择Linux发行版是一个见仁见智的事情。由于我的工作主要是从事服务器的维护和开发，所以在桌面选择是以轻量级为主。

每个公司生产环境可能选择不同的发行版体系，可能主要是RedHat体系（包括CentOS）或者Debian体系（包括Ubuntu）。

在[]()中对Ubuntu Server和Enterprise Linux(RHEL,CentOS等)做了一个对比，加上我自己的理解如下：

* Ubuntu Server基于Debian testing版本开发，所以内核版本和软件包版本要比Red Hat Enterprise Linux新很多，当然也带了一定的稳定性风险。
* Ubuntu Server采用的是升级软件包策略来更新服务器，能够保持服务器软件包以最新的版本来修复bug和安全漏洞。带来的优点是能够获得最新的功能以及bug修复，但是也同时带来了软件兼容性问题，这个兼容性问题特指你的应用所依赖的旧版本的库或者特性，如果你的应用软件能够随着开源社区进化而同步开发更新，则使用Ubuntu Server会带来较大的好处。
* RedHat RHEL/CentOS采用了不同的升级策略，即将新版本的bugfix和安全补丁反向back port到旧版本软件上。这样可以保持服务器能够尽可能稳定和向后兼容。所以通常人们都会觉得RedHat RHEL服务器非常稳定。但是带来的缺点是软件包比较陈旧，相对不容易获得上游软件的新特性。
* Red Hat公司的规模比Ubuntu的母公司Canonical要大，商业化运作更为成熟，雇佣了更多的开源开发者（企业级软件更多）
* 开发平台似乎更倾向于Ubuntu（我个人感觉很多开发工具包在Ubuntu上多于RHEL，有些工具甚至只有Ubuntu版本）
* 5年时间的LTS支持基本已经足够，大多数服务器的使用寿命也只有5年。不过对于大型企业，延续10年以上的平台也比较常见，所以大型企业比较倾向于RHEL。
* Fedora作为Red Hat的社区试验版本，采用的软件版本比较激进，所以面向REHL/CentOS的开发建议同样在RHEL/CentOS上开发(至少要完整测试) -- 有可能下一版本RHEL依然和当前版本Fedora不同（不兼容）。

> RHEL/CentOS可以采用Fedora项目提供的[EPEL软件仓库](http://fedoraproject.org/wiki/EPEL)来安装比较新（高版本）的应用软件和库，部分弥补了RHEL/CentOS软件因致力于稳定性采用的久经验证但较为落后的软件版本。

## 我的选择

2017年12月我选择了Fedora 26/27作为开发桌面工作平台，主要考虑公司使用的是AliOS（属于RHEL/CentOS体系）作为主流的服务器平台，能够更多学习Red Hat体系的维护技术。

不过，在开发软件上，ubuntu体系可用的软件包比CentOS要丰富得多，内核版本也要超前很多。2018年1月，我准备转为使用ubuntu LTS版本，当前为16.04，预计2018年4月可以转为18.04 LTS，基于以下原因：

* 内核版本更新：ubuntu 16.04为4.4；ubuntu 18.04预计为4.15，可以使用最新的内核特性
* 利用Ubuntu更为丰富的软件包进行开发
* 启用嵌套虚拟化技术，在Ubuntu内部嵌套运行CentOS，以获得Red Hat系列运维和开发经验
* Ubuntu的社区文档以及[StackOverflow活跃程度](https://insights.stackoverflow.com/trends?tags=ubuntu%2Ccentos%2Credhat)远高于RHEL/CentOS，方便个人学习探索

> [Red Hat付费客户支持网站解决知识库](https://access.redhat.com/)提供了大量的解决方案，如果有企业支持建议选择，文档质量比社区更好。

> 参考[RHEL 8 Speculation ???](http://centosfaq.org/centos/rhel-8-speculation/)讨论，按照RHEL7终止于2019Q4，则RHEL8可能会在2018Q4发布，倒推6个月 beta周期，则RHEL 8beta可能在2018Q2发布。所以有可能Fedora 27将作为RHEL 8的基础。
>
> 当前Fedora 27的内核版本为4.14，所以推测2018年Q2推出的RHEL8 beta将和Ubuntu 18.4 LTS采用相近的内核版本。两大主流发行版将齐头并进。

# Linux中文网站

* [Linux中国](https://linux.cn/) - Linux.Cn Translation Team (LCTT)提供了很多英文技术文档的翻译，个人觉得很多时候需要开拓视野，从这个入口开始是一个不错的选择。
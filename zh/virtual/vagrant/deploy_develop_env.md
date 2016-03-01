# Vagrant优势

* 对于`开发者`

Vagrant隔离了依赖和它们的配置到一个单一的一次性的，一致性的环境，不需要担忧任何使用的工具。一旦你或者其他人创建了一个[Vagrant文件](http://docs.vagrantup.com/v2/vagrantfile/)，你只需要使用 `vagrant up` 然后，所有软件被安装和配置。其他团队成员也适用相同的配置文件创建他们的环境，无论你们是工作在Linux， Mac OS X或Windows 。所有团队成员在相同环境中运行代码，基于相同的依赖。

* 对于`操作工程师`

Vagrant给予操作工程师一个一次性环境并且一致性的工作流用于开发和测试基础架构管理脚本。你可以快速地像shell脚本一样测试。Chef cookbooks， Puppet modules和使用本地虚拟化技术，诸如Virtualbo或VMware。然后，使用相同的配置，你可以在云平台，例如AWS或者RackSpace（两者使用相同的工作流）上测试这些脚本。放弃你自己定制的脚本来重启EC2绘画，停止针对不同主机调试SSH prompts，使用Vagrant可以给你的生活带来有序。

* 对于`设计师`

Vagrant自动化所有需要用于web app的环境，以便设计师专注于自己擅长的设计。对于开发提供的环境，只需要用相同的vagrant配置，使用命令 `vagrant up` 就可以开始设计。

# 安装

* 首先从[VirtualBox官方下载](https://www.virtualbox.org/wiki/Downloads)安装VirtualBox
* 访问[Vargant官方下载](https://www.vagrantup.com/downloads.html)安装Vargant

安装程序将自动添加`vagrant`到你的系统路径，这样就可以在终端中直接使用。如果你通过[RubyGems](http://en.wikipedia.org/wiki/RubyGems)安装了旧版本Vagrant 1.0.x，请删除掉重新安装最新版本。

> 当前版本已经不支持通过RubyGem安装

# 开始使用

> 更为详细的OReilly书籍[Vagrant: Up and Running](http://www.amazon.com/gp/product/1449335837/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449335837&linkCode=as2&tag=vagrant-20)

```bash
vagrant init hashicorp/precise32
vagrant up
```

上述命令创建运行 Ubuntu 12.04 LTS 32-bit的虚拟机，就可以通过 `vagrant ssh` 登录这个虚拟机

# 项目设置

配置任何Vagrant项目的第一步是创建一个[Vagrantfile](http://docs.vagrantup.com/v2/vagrantfile/)。这Vagrantfileyou两个目的：

* 标记项目的根目录，一些Vagrant配置归属到这个根目录中
* 描述主机类型和需要运行项目的资源，例如软件安装以及如何访问它

Vagrant有一个内建命令来初始化目录 `vagrant init` 。这个命令将`Vagrantfile`放到当前目录，可以查看这个文件（包含了很多注释和例子）。也可以在已经存在的目录执行 `vagrant init` 来设置Vagrant。

# Boxes

Vagrant使用一个基础镜像来clone虚拟机，这个基础镜像称为boxes，并且在 [HashiCorp's Atlas box catalog](https://atlas.hashicorp.com/boxes/search) 可以找到各种可用的镜像

以下以安装`vagrant init bento/centos-7.1`为例

```bash
mkdir centos-7.1
cd centos-7.1
vagrant init bento/centos-7.1
```

立即提示

```bash
A `Vagrantfile` has been placed in this directory. You are now
ready to `vagrant up` your first virtual environment! Please read
the comments in the Vagrantfile as well as documentation on
`vagrantup.com` for more information on using Vagrant.
```

在这个目录下执行

```bash
vagrant up
```

则开始下载镜像并启动

再增加一个`bento/centos-6.7`

```bash
mkdir centos-6.7
cd centos-6.7
vagrant init bento/centos-6.7
vagrant up
```

> [vagrant up下载镜像失败无法断点续传处理](#vagrant up下载镜像失败无法断点续传处理)

**如果你已经运行了`vagrant init`创建了box，则不再需要下面这个`vagrant box add`。** 这个操作是存储box到一个特殊的名字，这样多个Vagrant环境可以重用它。

通过多个项目，可以重用被添加的box。每个项目使用一个box来作为初始镜像来clone，并且永远不会更改这个基础镜像。这也意味着，如果有两个项目都是用前述的 `bento/centos-6.7`，添加文件到其中的一个guest主机，将不会影响另外一个主机。

# up 和 ssh

启动Vagrant环境

```bash
vagrant up

完成启动后，执行命令

```bash
vagrant ssh
```

这个`vagrant ssh`命令将登录到SSH环境。注意，不要使用 `rm -rf /` ，因为 Vagrant 共享了一个 `/vagrant` 实际是那个包含了 Vagrantfile 的物理服务器目录（但是这个目录由于可以从虚拟机中访问，所以要注意不要误删除）。

如果你不再需要这个虚拟机，则运行 `vagrant destroy` 来销毁虚拟机。

# SYNCED FOLDERS

> 这里我遇到一个问题，就是在虚拟机执行`df`命令，输出中显示一个错误

```bash
df: `/vagrant': No such file or directory
```

原因是升级过虚拟机中的Linux内核，需要[升级虚拟机中CentOS内核后重新编译VirtualBox扩展包的内核模块](#升级虚拟机中CentOS内核后重新编译VirtualBox扩展包的内核模块)

## 修改 synced 目录

可以通过修改 `Vagrantfile` 配置来实现对默认共享目录位置的修改，例如

```bash
config.vm.synced_folder "/Users/huatai/Documents/Vagrant/sharedata", "/sharedata"
```

> 可以用来在不同的虚拟机之间使用共享目录，这样方便部署一个简单的共享集群。即，在物理服务器上构建一个共享给多个虚拟机使用的网络存储（不需要单独部署NFS或者CIFS），方便构建测试集群。

# 备份

* `package` - [使用vagrant package打包VirtualBox环境](package.md)

# 快照

* `snapshot插件` - [使用vagrant snapshot创建快照备份](snapshot.md)

# 参考

* [Vagrant Docs](http://docs.vagrantup.com/)
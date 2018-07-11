Amazon Elastic Compute Cloud (Amazon EC2) 在 Amazon Web Services (AWS) 云中提供可扩展的计算容量。

Amazon EC2 提供以下功能：

* 虚拟计算环境，也称为实例
* 实例的预配置模板，也称为 Amazon 系统映像 (AMI)，其中包含服务器需要的软件包 (包括操作系统和其他软件)。
* 实例 CPU、内存、存储和网络容量的多种配置，也称为实例类型
* 使用密钥对的实例的安全登录信息 (AWS 存储公有密钥，用户在安全位置存储私有密钥)
* 临时数据 (停止或终止实例时会删除这些数据) 的存储卷，也称为实例存储卷
* 使用 Amazon Elastic Block Store (Amazon EBS) 的数据的持久性存储卷，也称为 Amazon EBS 卷。
* 用于存储资源的多个物理位置，例如实例和 Amazon EBS 卷，也称为区域和可用区
* 防火墙，让您可以指定协议、端口，以及能够使用安全组到达实例的源 IP 范围
* 用于动态云计算的静态 IPv4 地址，称为弹性 IP 地址
* 元数据，也称为标签，您可以创建元数据并分配给 Amazon EC2 资源
* 可以创建的虚拟网络，这些网络与其余 AWS 云在逻辑上隔离，并且可以选择连接私有的网络，也称为 Virtual Private Cloud (VPC)

> 参考[什么是 Amazon EC2？](http://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/concepts.html)

# 测试网络速度

[EC2 Reachability Test](http://ec2-reachability.amazonaws.com/)提供了AWS的EC2在全球服务器的可测试IP地址列表。可以在你本地尝试ping，检查到哪里的网络更快，方便选择合适的region。

> 在中国大陆，到美国西部的网络更快一些，`North California`约160ms。
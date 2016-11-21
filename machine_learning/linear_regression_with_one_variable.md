# 神经网络算法（梯度下降）

监督学习的案例：

人类司机在一条道路上驾驶汽车，使得计算机能够知晓在这条道路上如何行使（转向等等），因为人类给计算机一系列正确的行驶方向，所以这个案例属于监督学习。

自动驾驶是一种回归计算：连续变量的值

# 公式

m = 训练样本
x = 输入变量 (input variables / features)
y = 输出变量 (output variable / target variable)
(x,y) = training example 每一行表示一个训练样本
(xi,yi), 这里 i 表示第i行样本
h = 算法（历史原因选择了这个字母，也许可以解释为 hypothesis ，即假设）

例如对房屋的股价

X1 = size, X2 = bed room

h(X) = θ0 + θ1X1 + θ2X2

> θ 是 希腊字母 theta 
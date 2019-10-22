Oracle的JDBC是跨平台的数据库驱动，可以在ARM体系上运行。

[Raspberry Pi and Oracle](https://riesco.ch/2013/11/14/raspberry-pi-and-oracle/) 介绍的经验可以参考

* 针对不同的JDK版本（ARM上），从 [Oracle JDBC Driver and Companion JARs](https://www.oracle.com/database/technologies/jdbc-drivers-12c-downloads.html) 下载对应的JAR包
* 参考以下 Conn.java 代码:

```java
import java.sql.*;
class Conn {
public static void main (String[] args) throws Exception
{
Class.forName (“oracle.jdbc.OracleDriver”);

Connection conn = DriverManager.getConnection
(“jdbc:oracle:thin:@//ip_or_dns_name_of_oracle_server:port_server/SID_Database”, “login_database”, “password_database”);
// @//machineName:port/SID,   userid,  password
try {
Statement stmt = conn.createStatement();
try {
ResultSet rset = stmt.executeQuery(“select BANNER from SYS.V_$VERSION”);
try {
while (rset.next())
System.out.println (rset.getString(1));   // Print colon 1
}
finally {
try { rset.close(); } catch (Exception ignore) {}
}
}
finally {
try { stmt.close(); } catch (Exception ignore) {}
}
}
finally {
try { conn.close(); } catch (Exception ignore) {}
}
}
}
```

* 编译Java:

```bash
javac Conn.java
```

* 测试连接

```bash
java -cp /wherever_you_put_the_file/ojdbc7.jar:. Conn
```

以上我还没有实践，思路应该是可行。

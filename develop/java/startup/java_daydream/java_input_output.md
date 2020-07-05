
* 读取输入需要先生成一个 `Scanner` 对象
* 读取行字符串使用 Scanner 对象的 `nextLine()` 方法，读取单词则使用 `next()` 方法，读取数字则使用 `nextInt()` 方法

> 注意这里对象的方法名中，动词是小写，名词是首字母大写；有点类似对象(名词)首字母是大写

```java
import java.util.*;

public class InputTest {
    public static void main(String[] args){
        Scanner in = new Scanner(System.in);
        System.out.print("What is your name? ");
        String name = in.nextLine();

        System.out.print("How old are you? ");
        int age = in.nextInt();

        System.out.println("Hello, " + name + ", Next year, you'll be " + (age + 1));
    }
}
```

注意：输入是可见字符，所以`Scanner`不适合从控制台读取密码，控制台输入密码需要使用 `Console` 类的 `readPassword` 方法：

```java
Console cons = System.console();
String username = cons.readLine("User name: ");
char[] passwd = cons.readPassword("Password: ");
```

> `Console`对象只能一行行读取，不能读取一个单词或数值。

# 格式化输出

和C语言库函数的`printf`方法相同，可以格式化输出数值，字符串等。

```java
System.out.printf("Hello, %s, Next year, you'll be %d", name, age);
```

可以使用静态的 `String.format()` 方法创建一个格式化的字符串而不打印输出：

```java
String message = String.format("Hello, %s, Next year, you'll be %d", name, age);
```

# 文件输入与输出

要对文件进行读取，则需要使用 `File` 对象构建一个 `Scanner` 对象:

```java
Scanner in = new Scanner(Paths.get("myfile.txt"), "UTF-8");
```

> 注意，一定要使用 `Paths.get("myfile.txt")`， 不能直接用字符串来使用Scanner，例如以下案例会被解释成数据而不是文件名:

```java
Scanner in = new Scanner("myfile.txt");
```

要写入文件需要构建一个 `PrintWriter` 对象:

```java
PrintWriter out = new PrintWriter("myfile.txt", "UTF-8")
```

> 指定字符集是一个良好习惯，可以避免依赖操作系统默认编码。

由于读取文件可能不存在，即会出现 **异常** ，所以需要在 `main` 方法中使用 `throws` 子句标记:

```java
public static void main(String[] args) throws IOException {
    Scanner in = new Scanner(Paths.get("myfile.txt"), "UTF-8");
}
```

* 完整案例：

```java
import java.util.*;
import java.nio.file.*;

public class ReadFile {
    public static void main(String[] args) {
        Path source = Paths.get("ReadFile.java");
System.out.println("Reading from file: " + source);
        try (Scanner scanner = new Scanner(source)) {
            scanner.useDelimiter("\n");
            while (scanner.hasNext()) {
                Soystem.out.println(scanner.next());
            }
        } catch (Exception e){
            e.printStackTrace();
        }
    }
}
```

> `Paths` 是 `java.nio.file.Paths` 的方法

# 参考

* [Java Scanner from String File/Path InputStream](https://farenda.com/java/java-scanner-from-string-file-path-inputstream/)
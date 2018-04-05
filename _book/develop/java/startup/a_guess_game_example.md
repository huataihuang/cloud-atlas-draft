> 《Learn java the Easy Way》中第一个例子非常简单和巧妙，`推荐阅读原书`，作者循循善诱，娓娓道来，非常简明和清晰地让读者学习了：

* 变量（转换）
* 读取键盘输入 `Scanner(System.in)`
* 判断
* 循环（do/while 和 while）
* 系统输出 `System.out.println()`
* 对象释放( `scan.close()` )

```java
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
	// write your code here
        Scanner scan = new Scanner(System.in);
        String playAgain = "";

        do {
            // Create a random number for the user to guess
            int theNumber = (int) (Math.random() * 100 + 1);
            // System.out.println(theNumber);
            int guess = 0;
            while (guess != theNumber) {
                System.out.println("Guess a number between 1 and 100:");
                guess = scan.nextInt();
                if (guess < theNumber)
                    System.out.println(guess + " is too low. Try again.");
                else if (guess > theNumber)
                    System.out.println(guess + " is too high. Try again.");
                else
                    System.out.println(guess + " is correct. You win!");
                System.out.println("You entered " + guess + ".");
            }   // End of while loop for guessing
            System.out.println("Would you like to play again (y/n)?");
            playAgain = scan.next();
        } while (playAgain.equalsIgnoreCase("y"));
        System.out.println("Thank you for playing! Googbye.");
        scan.close();
    }

}
```
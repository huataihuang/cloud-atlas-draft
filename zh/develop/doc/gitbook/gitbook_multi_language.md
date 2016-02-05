# 多国语言

[Multi-language books](https://github.com/GitbookIO/gitbook/issues/34) 和 [Multi-Languages](https://help.gitbook.com/format/languages.html) 介绍了gitbook多国语言版本的文档撰写

    repository/
    LANGS.md
    en/
        README.md
        SUMMARY.md
        ...
    fr/
        README.md
        SUMMARY.md
        ...

Since gitbook can generate a book from a directory like en or fr, it can detect the LANGS.md file which should follow the format:

* [French](fr/)
* [English](en/)
* [中文](cn/)
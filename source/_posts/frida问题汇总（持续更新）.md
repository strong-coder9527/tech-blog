---
title: PassWall 零泄露配置与故障排查手册
date: 2026-06-05 01:00:00
categories:
  - 逆向
  - IOS逆向
  - Frida
tags:
  - IOS逆向
  - Frida
---

### 0x01 Process terminated

![image-20260611170039210](/images/iosre/image-20260611170039210.png)

根据这个issue找到了答案
https://github.com/frida/frida-core/issues/1239

解决方案1：

![image-20260611170223194](/images/iosre/image-20260611170223194.png)

解决方案2:删除Ellekit

![image-20260611170443830](/images/iosre/image-20260611170443830.png)


解决方3：使用 Choicy 隔离**（最推荐）

1. 在 Sileo/Zebra 中安装 **Choicy** 插件。
2. 前往系统设置，找到 **Choicy -> Applications**，选择你需要注入的 App。
3. 开启 **Disable Tweak Injection**（禁用插件注入）。
4. 重新打开 App 并运行 Frida，即可解决冲突。
---
title: "ADB 命令百科全书：从入门到高级"
date: "2026-07-13 15:08:42"
categories:
  - "逆向"
  - "安卓逆向"
  - "工具"
tags:
  - "adb"
---
> **用途**: Android 开发、测试、逆向分析、抓包、日志取证、性能排查、自动化调试。
> **适用**: 配合 🛠️ 工具链速查、04-Frida入门、10-抓包分析 使用。
> **前提**: 已安装 Android Platform Tools，终端可直接执行 `adb`。

---

## 📌 目录速查

| # | 章节 | 内容 |
|---|------|------|
| # | 章节 | 内容 |
|---|------|------|
| 1 | #1. 基础概念 | ADB 架构、连接方式、设备状态 |
| 2 | #2. 设备连接与状态 | devices、getprop、系统属性 |
| 3 | #3. USB调试常见问题 | unauthorized / offline / reconnect |
| 4 | #4. 无线ADB | Android 11+ 无线调试、TCP/IP |
| 5 | #5. Shell入门 | shell、su、root权限 |
| 6 | #6. 文件传输 | push / pull / ls / rm / df |
| 7 | #7. 安装卸载更新App | install、uninstall、split APK |
| 8 | #8. 包管理pm | list packages、dumpsys package、grant/revoke |
| 9 | #9. 启动Activity和页面跳转am | am start、monkey、intent参数 |
| 10 | #10. ServiceBroadcastContentProvider | startservice / broadcast / content query |
| 11 | #11. 输入点击滑动和自动化 | input tap / swipe / text / keyevent |
| 12 | #12. 截图与录屏 | screencap / screenrecord |
| 13 | #13. 日志logcat | logcat 过滤、崩溃/ANR分析 |
| 14 | #14. 进程线程和资源 | ps、top、meminfo、maps |
| 15 | #15. 网络排查 | ip / dns / ping / netstat / proxy |
| 16 | #16. 抓包tcpdump | tcpdump 抓 pcap、HTTPS注意事项 |
| 17 | #17. 端口转发和反向转发 | forward / reverse |
| 18 | #18. dumpsys系统诊断 | battery、activity、window、alarm等 |
| 19 | #19. settings系统设置 | list / get / put settings、关闭动画 |
| 20 | #20. 逆向分析常用ADB | 拉包、看进程、私有目录、数据库取证 |
| 21 | #21. Frida配合ADB | frida-server、端口转发、常见问题 |
| 22 | #22. App数据与备份 | pm clear / backup / root tar |
| 23 | #23. 性能分析 | 启动时间、FPS、内存、CPU、atrace |
| 24 | #24. Monkey压测 | monkey 随机测试、忽略崩溃 |
| 25 | #25. Rootremount和系统分区 | adb root / remount、危险提醒 |
| 26 | #26. 权限与AppOps | pm grant / revoke、appops set/get |
| 27 | #27. 定位时间语言 | location / date / locale |
| 28 | #28. 剪贴板输入法键盘 | ime list/set、clipboard |
| 29 | #29. 模拟器常用命令 | emulator / adb emu |
| 30 | #30. 常见系统页面跳转 | am start settings... |
| 31 | #31. 安全测试和隐私检查 | 明文日志、敏感文件、导出组件 |
| 32 | #32. 证书和代理调试 | proxy设置、Android 7+ CA信任问题 |
| 33 | #33. 数据库和文件取证 | sqlite3、缓存分析 |
| 34 | #34. 常见错误与解决 | unauthorized / version downgrade / permission denied |
| 35 | #35. 常用一键组合 | 安装启动、重启看日志、截图抓包 |
| 36 | #36. 开发调试建议 | 崩溃/启动慢调试流程 |
| 37 | #37. 逆向分析建议 | 逆向前收集、运行时观察、网络入口分析 |
| 38 | #38. 危险命令清单 | pm clear / uninstall / rm -rf / reboot 等 |
| 39 | #39. 建议的本地工具搭配 | 开发/逆向/抓包/文件分析工具链 |
| 40 | #40. ADB排查思路模板 | 10步排查流程 |
| 41 | #41. 快速速查 | 按类别速查命令汇总 |
| 42 | #42. 最后建议 | ADB三类工具定位、排查链路 |

---

## 1. 基础概念

ADB 分三层：

```text
电脑 adb client  ->  adb server  ->  手机 adbd
```

常见连接方式：

```text
USB 调试：电脑通过数据线连接手机
无线调试：电脑通过局域网连接手机
模拟器：本机端口连接 emulator
```

常见对象：

```text
device       真机
emulator     模拟器
offline      设备曾连接但当前不可用
unauthorized 手机未授权电脑 RSA 指纹
recovery     Recovery 模式
sideload     ADB sideload 模式
fastboot     不是 ADB，是 bootloader 刷机模式
```

---

## 2. 设备连接与状态

查看设备：

```bash
adb devices
adb devices -l
```

指定设备执行命令：

```bash
adb -s 设备序列号 shell
adb -s 设备序列号 install app.apk
```

查看设备序列号：

```bash
adb get-serialno
```

查看设备状态：

```bash
adb get-state
```

重启 ADB 服务：

```bash
adb kill-server
adb start-server
```

查看 ADB 版本：

```bash
adb version
```

查看手机系统属性：

```bash
adb shell getprop
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell getprop ro.product.cpu.abi
```

常用设备信息：

```bash
adb shell getprop ro.product.brand
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.device
adb shell getprop ro.product.model
adb shell getprop ro.build.fingerprint
adb shell getprop ro.debuggable
adb shell getprop ro.secure
```

---

## 3. USB调试常见问题

设备显示 `unauthorized`：

```bash
adb kill-server
adb start-server
adb devices
```

然后在手机上确认 RSA 授权。

设备显示 `offline`：

```bash
adb reconnect
adb kill-server
adb start-server
adb devices
```

强制重连 USB：

```bash
adb reconnect device
```

重启手机端 adbd：

```bash
adb usb
```

查看 USB 连接模式：

```bash
adb shell getprop sys.usb.config
adb shell getprop sys.usb.state
```

---

## 4. 无线ADB

Android 11 及以上推荐使用"无线调试"配对：

```bash
adb pair 手机IP:配对端口
adb connect 手机IP:连接端口
adb devices
```

老方式，先 USB 连接，再切 TCP：

```bash
adb tcpip 5555
adb connect 手机IP:5555
adb devices
```

切回 USB：

```bash
adb usb
```

断开无线连接：

```bash
adb disconnect
adb disconnect 手机IP:5555
```

查看手机 IP：

```bash
adb shell ip addr show wlan0
adb shell ifconfig wlan0
adb shell ip route
```

---

## 5. Shell入门

进入手机 shell：

```bash
adb shell
```

直接执行命令：

```bash
adb shell id
adb shell whoami
adb shell pwd
adb shell ls /
```

查看当前用户：

```bash
adb shell id
```

普通 shell 通常是：

```text
uid=2000(shell)
```

Root shell 可能是：

```text
uid=0(root)
```

Root 设备执行 root 命令：

```bash
adb shell su -c id
adb shell su -c 'ls /data/data'
```

---

## 6. 文件传输

电脑传到手机：

```bash
adb push 本地文件 手机路径
adb push app.apk /sdcard/Download/
```

手机拉到电脑：

```bash
adb pull 手机路径 本地路径
adb pull /sdcard/Download/a.pcap ~/Desktop/
```

查看文件：

```bash
adb shell ls -lh /sdcard/Download/
adb shell cat /sdcard/Download/test.txt
```

创建目录：

```bash
adb shell mkdir -p /sdcard/Download/test
```

删除文件，危险：

```bash
adb shell rm /sdcard/Download/test.txt
adb shell rm -rf /sdcard/Download/test
```

查看磁盘空间：

```bash
adb shell df -h
adb shell du -h /sdcard/Download
```

---

## 7. 安装、卸载、更新App

安装 APK：

```bash
adb install app.apk
```

覆盖安装：

```bash
adb install -r app.apk
```

允许降级安装：

```bash
adb install -r -d app.apk
```

保留数据重装：

```bash
adb install -r app.apk
```

授予运行时权限安装：

```bash
adb install -g app.apk
```

卸载 App，危险：

```bash
adb uninstall 包名
```

卸载但保留数据：

```bash
adb uninstall -k 包名
```

安装多个 split APK：

```bash
adb install-multiple base.apk split_config.arm64_v8a.apk split_config.zh.apk
```

安装 APKM/APKS 通常需要先拆包，或使用 bundletool。

查看安装路径：

```bash
adb shell pm path 包名
```

拉取已安装 APK：

```bash
adb shell pm path 包名
adb pull /data/app/具体路径/base.apk .
```

---

## 8. 包管理pm

列出所有包：

```bash
adb shell pm list packages
```

列出第三方包：

```bash
adb shell pm list packages -3
```

列出系统包：

```bash
adb shell pm list packages -s
```

带路径列出：

```bash
adb shell pm list packages -f
```

按关键词找包：

```bash
adb shell pm list packages | grep keyword
```

查看 App 详细信息：

```bash
adb shell dumpsys package 包名
```

查看版本号：

```bash
adb shell dumpsys package 包名 | grep version
```

启用 App：

```bash
adb shell pm enable 包名
```

禁用 App，危险：

```bash
adb shell pm disable-user 包名
```

清空 App 数据，危险：

```bash
adb shell pm clear 包名
```

查看权限：

```bash
adb shell dumpsys package 包名 | grep permission
```

授予权限：

```bash
adb shell pm grant 包名 android.permission.CAMERA
```

撤销权限：

```bash
adb shell pm revoke 包名 android.permission.CAMERA
```

---

## 9. 启动Activity和页面跳转am

启动 App 主入口：

```bash
adb shell monkey -p 包名 -c android.intent.category.LAUNCHER 1
```

启动指定 Activity：

```bash
adb shell am start -n 包名/完整Activity名
adb shell am start -n com.example.app/.MainActivity
```

强制停止 App：

```bash
adb shell am force-stop 包名
```

清空并启动：

```bash
adb shell am force-stop 包名
adb shell monkey -p 包名 -c android.intent.category.LAUNCHER 1
```

打开 URL：

```bash
adb shell am start -a android.intent.action.VIEW -d 'https://example.com'
```

发送文本 Intent：

```bash
adb shell am start -a android.intent.action.SEND -t text/plain --es android.intent.extra.TEXT 'hello'
```

传 extra 参数：

```bash
adb shell am start -n 包名/.MainActivity --es key value
adb shell am start -n 包名/.MainActivity --ei count 1
adb shell am start -n 包名/.MainActivity --ez debug true
```

查看当前前台 Activity：

```bash
adb shell dumpsys activity top
adb shell dumpsys activity activities | grep mResumedActivity
adb shell dumpsys window | grep mCurrentFocus
```

---

## 10. Service、Broadcast、ContentProvider

启动 Service：

```bash
adb shell am startservice -n 包名/.ServiceName
```

停止 Service：

```bash
adb shell am stopservice -n 包名/.ServiceName
```

发送广播：

```bash
adb shell am broadcast -a 自定义ACTION
adb shell am broadcast -a 自定义ACTION --es key value
```

查看 Service：

```bash
adb shell dumpsys activity services 包名
```

查询 ContentProvider，需目标允许访问：

```bash
adb shell content query --uri content://authority/path
```

插入 ContentProvider，危险：

```bash
adb shell content insert --uri content://authority/path --bind key:s:value
```

删除 ContentProvider，危险：

```bash
adb shell content delete --uri content://authority/path
```

---

## 11. 输入、点击、滑动和自动化

点击坐标：

```bash
adb shell input tap 500 1200
```

滑动：

```bash
adb shell input swipe 500 1800 500 500 300
```

长按：

```bash
adb shell input swipe 500 1200 500 1200 1000
```

输入文本：

```bash
adb shell input text hello
adb shell input text 123456
```

输入空格：

```bash
adb shell input text 'hello%sworld'
```

按键：

```bash
adb shell input keyevent KEYCODE_BACK
adb shell input keyevent KEYCODE_HOME
adb shell input keyevent KEYCODE_ENTER
adb shell input keyevent KEYCODE_DEL
adb shell input keyevent KEYCODE_POWER
adb shell input keyevent KEYCODE_VOLUME_UP
adb shell input keyevent KEYCODE_VOLUME_DOWN
```

常用 keyevent：

```text
KEYCODE_BACK          返回
KEYCODE_HOME          回桌面
KEYCODE_MENU          菜单
KEYCODE_ENTER         回车
KEYCODE_DEL           删除
KEYCODE_TAB           Tab
KEYCODE_SPACE         空格
KEYCODE_POWER         电源键
KEYCODE_WAKEUP        唤醒
KEYCODE_SLEEP         熄屏
KEYCODE_APP_SWITCH    最近任务
```

解锁常用组合：

```bash
adb shell input keyevent KEYCODE_WAKEUP
adb shell input swipe 500 1800 500 500 300
```

自动点按循环，谨慎：

```bash
while true; do adb shell input tap 500 1200; sleep 1; done
```

---

## 12. 截图与录屏

截图到手机：

```bash
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png .
```

截图直接保存到电脑：

```bash
adb exec-out screencap -p > screen.png
```

录屏：

```bash
adb shell screenrecord /sdcard/demo.mp4
adb pull /sdcard/demo.mp4 .
```

限制录屏时长：

```bash
adb shell screenrecord --time-limit 30 /sdcard/demo.mp4
```

指定分辨率和码率：

```bash
adb shell screenrecord --size 720x1280 --bit-rate 4000000 /sdcard/demo.mp4
```

---

## 13. 日志logcat

实时查看日志：

```bash
adb logcat
```

清空日志，谨慎：

```bash
adb logcat -c
```

保存日志：

```bash
adb logcat -v time > logcat.txt
```

查看最近日志：

```bash
adb logcat -d
```

按包名过滤，先找 PID：

```bash
adb shell pidof 包名
adb logcat --pid PID
```

按关键词过滤：

```bash
adb logcat | grep -i token
adb logcat | grep -i error
```

只看错误：

```bash
adb logcat *:E
```

指定格式：

```bash
adb logcat -v time
adb logcat -v threadtime
adb logcat -v color
```

查看崩溃日志：

```bash
adb logcat -d | grep -i 'FATAL EXCEPTION'
adb logcat -d | grep -i 'AndroidRuntime'
```

查看 ANR：

```bash
adb shell ls /data/anr
adb shell cat /data/anr/traces.txt
```

普通非 root 设备可能无法读取 `/data/anr`。

---

## 14. 进程、线程和资源

查看进程：

```bash
adb shell ps -A
adb shell ps -A | grep 包名
adb shell pidof 包名
```

查看线程：

```bash
adb shell ps -T -p PID
```

杀进程，危险：

```bash
adb shell kill PID
adb shell am force-stop 包名
```

查看 top：

```bash
adb shell top
adb shell top -H -p PID
```

查看内存：

```bash
adb shell dumpsys meminfo 包名
adb shell dumpsys meminfo PID
```

查看 CPU 调度：

```bash
adb shell cat /proc/PID/status
adb shell cat /proc/PID/stat
```

查看打开文件：

```bash
adb shell ls -l /proc/PID/fd
```

查看 maps：

```bash
adb shell cat /proc/PID/maps
```

查看加载 so：

```bash
adb shell cat /proc/PID/maps | grep '.so'
```

---

## 15. 网络排查

查看 IP：

```bash
adb shell ip addr
adb shell ip route
```

查看 DNS：

```bash
adb shell getprop net.dns1
adb shell getprop net.dns2
adb shell getprop | grep dns
```

Ping：

```bash
adb shell ping -c 4 <TEST_IP>
adb shell ping -c 4 example.com
```

查看连接：

```bash
adb shell netstat -an
adb shell ss -tunap
```

不同 Android 版本可能没有 `netstat` 或 `ss`。

查看某进程网络 fd：

```bash
adb shell ls -l /proc/PID/fd | grep socket
```

查看路由：

```bash
adb shell ip route show
```

查看 Wi-Fi：

```bash
adb shell dumpsys wifi
```

查看蜂窝网络：

```bash
adb shell dumpsys telephony.registry
adb shell dumpsys connectivity
```

查看代理：

```bash
adb shell settings get global http_proxy
adb shell settings get global global_http_proxy_host
adb shell settings get global global_http_proxy_port
```

设置代理：

```bash
adb shell settings put global http_proxy 电脑IP:代理端口
```

取消代理：

```bash
adb shell settings put global http_proxy :0
adb shell settings delete global http_proxy
```

---

## 16. 抓包tcpdump

确认 tcpdump 是否存在：

```bash
adb shell which tcpdump
adb shell ls /system/bin/tcpdump
```

Root 设备抓全部网卡：

```bash
adb shell su -c '/system/bin/tcpdump -i any -s 0 -w /sdcard/Download/capture.pcap'
adb pull /sdcard/Download/capture.pcap .
```

直接流式保存到电脑：

```bash
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U -w -' > capture.pcap
```

只抓某端口：

```bash
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U port 443 -w -' > https.pcap
```

只抓某 IP：

```bash
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U host <TARGET_IP> -w -' > host.pcap
```

停止 tcpdump：

```bash
adb shell su -c 'pkill -2 tcpdump'
```

注意：

- HTTPS 抓包只能看到 IP、域名 SNI、证书、流量大小和时间，默认看不到明文接口路径。
- 想看 HTTPS 明文，需要代理证书、系统证书、Frida hook、服务端日志或测试环境开调试。
- Flutter/Dart、Cronet、自研 native TLS 可能绕过 Java 层代理和 OkHttp hook。

---

## 17. 端口转发和反向转发

电脑端口转发到手机：

```bash
adb forward tcp:27042 tcp:27042
adb forward tcp:8080 tcp:8080
```

手机访问电脑服务：

```bash
adb reverse tcp:8080 tcp:8080
```

列出转发：

```bash
adb forward --list
adb reverse --list
```

移除转发：

```bash
adb forward --remove tcp:8080
adb reverse --remove tcp:8080
```

移除所有：

```bash
adb forward --remove-all
adb reverse --remove-all
```

常见用途：

```text
Frida server: adb forward tcp:27042 tcp:27042
本地 Web 调试: adb reverse tcp:3000 tcp:3000
Burp/Charles 代理: 手机 Wi-Fi 代理指向电脑 IP:端口
```

---

## 18. dumpsys系统诊断

查看所有服务：

```bash
adb shell dumpsys -l
```

电池：

```bash
adb shell dumpsys battery
```

恢复真实电池状态：

```bash
adb shell dumpsys battery reset
```

模拟充电状态：

```bash
adb shell dumpsys battery set status 2
adb shell dumpsys battery set level 100
```

Activity：

```bash
adb shell dumpsys activity
adb shell dumpsys activity top
adb shell dumpsys activity activities
```

Window：

```bash
adb shell dumpsys window
adb shell dumpsys window | grep mCurrentFocus
```

包信息：

```bash
adb shell dumpsys package 包名
```

网络：

```bash
adb shell dumpsys connectivity
adb shell dumpsys netstats
adb shell dumpsys wifi
```

通知：

```bash
adb shell dumpsys notification
```

输入法：

```bash
adb shell dumpsys input_method
```

剪贴板，新版本可能受限：

```bash
adb shell cmd clipboard get
```

JobScheduler：

```bash
adb shell dumpsys jobscheduler
```

Alarm：

```bash
adb shell dumpsys alarm
```

定位：

```bash
adb shell dumpsys location
```

传感器：

```bash
adb shell dumpsys sensorservice
```

SurfaceFlinger：

```bash
adb shell dumpsys SurfaceFlinger
```

---

## 19. settings系统设置

查看设置：

```bash
adb shell settings list system
adb shell settings list secure
adb shell settings list global
```

读取设置：

```bash
adb shell settings get global http_proxy
adb shell settings get system screen_brightness
```

修改设置：

```bash
adb shell settings put system screen_brightness 120
```

删除设置：

```bash
adb shell settings delete global http_proxy
```

保持屏幕常亮：

```bash
adb shell settings put global stay_on_while_plugged_in 3
```

关闭动画，适合自动化测试：

```bash
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
```

恢复动画：

```bash
adb shell settings put global window_animation_scale 1
adb shell settings put global transition_animation_scale 1
adb shell settings put global animator_duration_scale 1
```

---

## 20. 逆向分析常用ADB

找包名：

```bash
adb shell pm list packages -3
adb shell pm list packages | grep keyword
```

找安装路径：

```bash
adb shell pm path 包名
```

拉 APK：

```bash
adb pull /data/app/路径/base.apk .
```

查看当前 Activity：

```bash
adb shell dumpsys window | grep mCurrentFocus
adb shell dumpsys activity activities | grep mResumedActivity
```

查看进程：

```bash
adb shell ps -A | grep 包名
adb shell pidof 包名
```

查看 so 加载：

```bash
adb shell cat /proc/PID/maps | grep '.so'
```

查看 App 私有目录，普通设备通常无权限：

```bash
adb shell run-as 包名 ls
adb shell run-as 包名 ls files
adb shell run-as 包名 cat files/config.json
```

`run-as` 只对 debuggable App 生效。

Root 查看私有目录：

```bash
adb shell su -c 'ls /data/data/包名'
adb shell su -c 'find /data/data/包名 -maxdepth 2 -type f'
```

拉数据库：

```bash
adb shell su -c 'cp /data/data/包名/databases/db.sqlite /sdcard/Download/db.sqlite'
adb pull /sdcard/Download/db.sqlite .
```

查看 shared_prefs：

```bash
adb shell su -c 'ls /data/data/包名/shared_prefs'
adb shell su -c 'cat /data/data/包名/shared_prefs/*.xml'
```

查看 native 崩溃 tombstone：

```bash
adb shell ls /data/tombstones
adb shell su -c 'cat /data/tombstones/tombstone_00'
```

---

## 21. Frida配合ADB

查看架构：

```bash
adb shell getprop ro.product.cpu.abi
```

推送 frida-server：

```bash
adb push frida-server /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server
```

Root 启动：

```bash
adb shell su -c '/data/local/tmp/frida-server &'
```

端口转发：

```bash
adb forward tcp:27042 tcp:27042
adb forward tcp:27043 tcp:27043
```

查看进程：

```bash
frida-ps -Uai
```

附加进程：

```bash
frida -U -n 包名 -l hook.js
```

Spawn 启动：

```bash
frida -U -f 包名 -l hook.js
```

常见问题：

```text
unable to find process：包名不对、进程未启动、实际进程是 :pushservice 等子进程
connection refused：frida-server 未启动或端口未 forward
ABI mismatch：frida-server 架构不匹配
version mismatch：电脑 frida 和手机 frida-server 版本不一致
```

---

## 22. App数据与备份

清数据，危险：

```bash
adb shell pm clear 包名
```

Android 老版本备份：

```bash
adb backup -f app.ab 包名
```

Android 新版本很多 App 默认禁用 adb backup。

Root 备份私有目录：

```bash
adb shell su -c 'tar -czf /sdcard/Download/appdata.tgz /data/data/包名'
adb pull /sdcard/Download/appdata.tgz .
```

Root 恢复私有目录，危险：

```bash
adb push appdata.tgz /sdcard/Download/
adb shell su -c 'tar -xzf /sdcard/Download/appdata.tgz -C /'
```

---

## 23. 性能分析

启动时间：

```bash
adb shell am start -W -n 包名/.MainActivity
```

输出重点：

```text
ThisTime
TotalTime
WaitTime
```

FPS 和渲染：

```bash
adb shell dumpsys gfxinfo 包名
adb shell dumpsys gfxinfo 包名 framestats
```

内存：

```bash
adb shell dumpsys meminfo 包名
```

CPU：

```bash
adb shell top -H -p PID
```

电量：

```bash
adb shell dumpsys batterystats
adb shell dumpsys batterystats 包名
```

重置电量统计：

```bash
adb shell dumpsys batterystats --reset
```

系统 trace：

```bash
adb shell atrace --list_categories
adb shell atrace -z -b 4096 -t 10 gfx input view sched freq idle am wm > trace.html
```

Android 10+ 推荐 Perfetto。

---

## 24. Monkey压测

简单随机压测：

```bash
adb shell monkey -p 包名 1000
```

带日志和 seed：

```bash
adb shell monkey -p 包名 -s 1234 -v 1000
```

限制事件类型：

```bash
adb shell monkey -p 包名 --pct-touch 70 --pct-motion 20 --pct-nav 10 -v 1000
```

忽略崩溃继续跑，谨慎：

```bash
adb shell monkey -p 包名 --ignore-crashes --ignore-timeouts -v 10000
```

常见用途：

```text
找随机崩溃
看内存增长
看 ANR
看弱网恢复
看 Activity 生命周期问题
```

---

## 25. Root、remount和系统分区

尝试 root adbd：

```bash
adb root
```

用户版系统通常不允许。

重新挂载系统分区，危险：

```bash
adb remount
```

查看挂载：

```bash
adb shell mount
```

Magisk/root 常用：

```bash
adb shell su -c id
adb shell su -c 'mount -o rw,remount /'
```

危险提醒：

- 修改 `/system`、`/vendor`、`/product` 可能导致系统无法启动。
- 新 Android 多数使用动态分区和只读校验，不能按老方法随便改。

---

## 26. 权限与AppOps

查看权限：

```bash
adb shell dumpsys package 包名 | grep permission
```

授予运行时权限：

```bash
adb shell pm grant 包名 android.permission.CAMERA
adb shell pm grant 包名 android.permission.RECORD_AUDIO
adb shell pm grant 包名 android.permission.ACCESS_FINE_LOCATION
```

撤销权限：

```bash
adb shell pm revoke 包名 android.permission.CAMERA
```

查看 AppOps：

```bash
adb shell appops get 包名
```

设置 AppOps：

```bash
adb shell appops set 包名 CAMERA allow
adb shell appops set 包名 RECORD_AUDIO deny
adb shell appops set 包名 ACCESS_FINE_LOCATION ignore
```

恢复默认：

```bash
adb shell appops reset 包名
```

---

## 27. 定位、时间、语言

打开定位页面：

```bash
adb shell am start -a android.settings.LOCATION_SOURCE_SETTINGS
```

查看定位服务：

```bash
adb shell dumpsys location
```

设置时间需要权限或 root：

```bash
adb shell date
adb shell su -c 'date 052712302026.00'
```

查看时区：

```bash
adb shell getprop persist.sys.timezone
```

设置语言区域，部分系统需要重启或权限：

```bash
adb shell setprop persist.sys.locale zh-CN
adb reboot
```

---

## 28. 剪贴板、输入法、键盘

查看输入法：

```bash
adb shell ime list -s
```

启用输入法：

```bash
adb shell ime enable 输入法ID
```

切换输入法：

```bash
adb shell ime set 输入法ID
```

查看当前输入法：

```bash
adb shell settings get secure default_input_method
```

剪贴板在新 Android 上限制较多：

```bash
adb shell cmd clipboard get
adb shell cmd clipboard set 'hello'
```

---

## 29. 模拟器常用命令

列出模拟器：

```bash
emulator -list-avds
```

启动模拟器：

```bash
emulator -avd AVD_NAME
```

连接模拟器：

```bash
adb devices
adb -s emulator-5554 shell
```

模拟来电：

```bash
adb emu gsm call 10086
```

模拟短信：

```bash
adb emu sms send 10086 hello
```

模拟电量：

```bash
adb emu power capacity 50
```

---

## 30. 常见系统页面跳转

打开应用详情：

```bash
adb shell am start -a android.settings.APPLICATION_DETAILS_SETTINGS -d package:包名
```

打开 Wi-Fi：

```bash
adb shell am start -a android.settings.WIFI_SETTINGS
```

打开开发者选项：

```bash
adb shell am start -a android.settings.APPLICATION_DEVELOPMENT_SETTINGS
```

打开无障碍：

```bash
adb shell am start -a android.settings.ACCESSIBILITY_SETTINGS
```

打开 VPN：

```bash
adb shell am start -a android.settings.VPN_SETTINGS
```

打开语言设置：

```bash
adb shell am start -a android.settings.LOCALE_SETTINGS
```

打开日期时间：

```bash
adb shell am start -a android.settings.DATE_SETTINGS
```

---

## 31. 安全测试和隐私检查

查看明文日志风险：

```bash
adb logcat -d | grep -Ei 'token|password|passwd|secret|authorization|cookie|phone|idcard'
```

查看本地敏感文件：

```bash
adb shell su -c 'find /data/data/包名 -type f | head -200'
adb shell su -c 'grep -R "token\|password\|secret" /data/data/包名 2>/dev/null'
```

查看 WebView 调试：

```bash
adb shell cat /proc/net/unix | grep webview
```

查看导出组件：

```bash
adb shell dumpsys package 包名 | grep -A 5 -E 'Activity|Service|Receiver|Provider'
```

查看网络域名，抓包侧：

```bash
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U -w -' > app.pcap
```

再用 Wireshark 或 tshark 看 DNS/SNI。

---

## 32. 证书和代理调试

查看代理：

```bash
adb shell settings get global http_proxy
```

设置代理：

```bash
adb shell settings put global http_proxy 电脑IP:8888
```

取消代理：

```bash
adb shell settings put global http_proxy :0
adb shell settings delete global http_proxy
```

Android 7+ 默认不信任用户 CA，抓 HTTPS 明文通常需要：

```text
1. App network_security_config 允许用户证书
2. 系统证书安装
3. Root/Magisk 证书模块
4. Frida 绕过证书绑定
5. 服务端测试环境关闭 pinning
```

只看 TLS SNI：

```bash
tshark -r app.pcap -Y 'tls.handshake.extensions_server_name' -T fields -e frame.time -e tls.handshake.extensions_server_name
```

---

## 33. 数据库和文件取证

列数据库：

```bash
adb shell su -c 'find /data/data/包名 -name "*.db" -o -name "*.sqlite"'
```

拉数据库：

```bash
adb shell su -c 'cp /data/data/包名/databases/a.db /sdcard/Download/a.db'
adb pull /sdcard/Download/a.db .
```

查看 SQLite：

```bash
adb shell sqlite3 /sdcard/Download/a.db '.tables'
```

不是所有系统都有 sqlite3。

查看缓存：

```bash
adb shell su -c 'du -h /data/data/包名/cache'
adb shell su -c 'ls -lh /data/data/包名/cache'
```

---

## 34. 常见错误与解决

`adb: device unauthorized`

```text
原因：手机未授权电脑 RSA 指纹。
处理：拔插数据线，关闭再打开 USB 调试，确认授权弹窗。
```

`adb: more than one device/emulator`

```bash
adb devices
adb -s 设备序列号 shell
```

`INSTALL_FAILED_VERSION_DOWNGRADE`

```bash
adb install -r -d app.apk
```

`INSTALL_FAILED_UPDATE_INCOMPATIBLE`

```text
原因：签名不一致。
处理：卸载旧包再装。会丢数据。
```

```bash
adb uninstall 包名
adb install app.apk
```

`Permission denied`

```text
原因：shell 用户权限不足。
处理：使用 run-as、root、或换可访问路径。
```

`Read-only file system`

```text
原因：系统分区只读。
处理：需要 root/remount，且可能被动态分区/verity 限制。
```

`closed`

```text
原因：设备断连、手机锁屏策略、线材问题、adbd 重启。
处理：换线、重新授权、adb kill-server。
```

---

## 35. 常用一键组合

安装并启动：

```bash
adb install -r app.apk
adb shell monkey -p 包名 -c android.intent.category.LAUNCHER 1
```

重启 App 并看日志：

```bash
adb shell am force-stop 包名
adb logcat -c
adb shell monkey -p 包名 -c android.intent.category.LAUNCHER 1
adb logcat --pid $(adb shell pidof 包名 | tr -d '\r')
```

截图当前页面：

```bash
adb exec-out screencap -p > screen.png
```

抓包 60 秒：

```bash
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U -w -' > capture.pcap
```

查看当前 Activity：

```bash
adb shell dumpsys window | grep mCurrentFocus
```

查看包版本：

```bash
adb shell dumpsys package 包名 | grep -E 'versionName|versionCode'
```

拉 APK：

```bash
adb shell pm path 包名
adb pull /data/app/xxx/base.apk .
```

---

## 36. 开发调试建议

开发阶段常用：

```bash
adb install -r -g app.apk
adb logcat --pid $(adb shell pidof 包名 | tr -d '\r')
adb shell am force-stop 包名
adb shell am start -W -n 包名/.MainActivity
adb shell dumpsys meminfo 包名
adb shell dumpsys gfxinfo 包名
```

调试崩溃：

```bash
adb logcat -c
adb shell monkey -p 包名 -v 1000
adb logcat -d > crash.log
```

调试启动慢：

```bash
adb shell am force-stop 包名
adb shell am start -W -n 包名/.MainActivity
adb shell dumpsys gfxinfo 包名 framestats
```

---

## 37. 逆向分析建议

逆向前先收集：

```bash
adb shell pm path 包名
adb shell dumpsys package 包名 > package.txt
adb shell pidof 包名
adb shell dumpsys window | grep mCurrentFocus
adb logcat -d > logcat.txt
```

运行时观察：

```bash
adb shell ps -A | grep 包名
adb shell cat /proc/PID/maps | grep '.so'
adb shell ls -l /proc/PID/fd
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U -w -' > runtime.pcap
```

看网络入口：

```text
1. 静态分析 APK 字符串：域名、路径、证书、公钥、SDK 名称。
2. 动态抓包：DNS、SNI、IP、端口、连接时间。
3. logcat：接口错误、登录状态、SDK 日志。
4. Frida：Java/Native/Flutter/Dart 层 hook。
5. 服务端日志：最终确认 path、status、用户、设备、IP、限流命中。
```

---

## 38. 危险命令清单

这些命令执行前必须确认：

```bash
adb shell pm clear 包名
adb uninstall 包名
adb shell rm -rf 路径
adb shell reboot
adb reboot bootloader
adb reboot recovery
adb remount
adb shell su -c 'mount -o rw,remount /'
adb shell settings put global ...
adb shell appops set ...
adb shell content delete ...
```

危险原因：

```text
pm clear：删除 App 数据
uninstall：卸载 App
rm -rf：删除文件
reboot bootloader：进刷机模式
remount：改系统分区
settings/appops：可能改变系统行为
content delete：可能删除 Provider 数据
```

---

## 39. 建议的本地工具搭配

开发：

```text
Android Studio
adb
logcat
Perfetto
Layout Inspector
```

逆向：

```text
jadx
apktool
Frida
Objection
Ghidra / IDA
Wireshark
tshark
tcpdump
```

抓包：

```text
Charles
Burp Suite
mitmproxy
Wireshark
tcpdump
r0capture
```

文件分析：

```text
sqlite3
strings
file
xxd
jq
rg
```

---

## 40. ADB排查思路模板

遇到 App 问题，可以按这个顺序排：

```text
1. 设备是否连接：adb devices -l
2. App 是否安装：adb shell pm list packages | grep 包名
3. App 是否运行：adb shell pidof 包名
4. 当前页面是谁：adb shell dumpsys window | grep mCurrentFocus
5. 是否崩溃：adb logcat -d | grep -i AndroidRuntime
6. 是否 ANR：adb logcat -d | grep -i ANR
7. 网络是否通：adb shell ping -c 4 域名
8. 是否有代理：adb shell settings get global http_proxy
9. 后端连哪里：tcpdump + Wireshark 看 DNS/SNI/IP
10. 本地数据是否异常：run-as/root 看 shared_prefs、databases、files
```

---

## 41. 快速速查

```bash
# 设备
adb devices -l
adb kill-server
adb start-server

# Shell
adb shell
adb shell id

# 安装
adb install -r app.apk
adb uninstall 包名

# 启动
adb shell monkey -p 包名 -c android.intent.category.LAUNCHER 1
adb shell am force-stop 包名

# 包信息
adb shell pm list packages -3
adb shell pm path 包名
adb shell dumpsys package 包名

# 当前页面
adb shell dumpsys window | grep mCurrentFocus
adb shell dumpsys activity top

# 日志
adb logcat -v time
adb logcat --pid PID
adb logcat -d > logcat.txt

# 文件
adb push local remote
adb pull remote local

# 截图录屏
adb exec-out screencap -p > screen.png
adb shell screenrecord /sdcard/demo.mp4

# 输入
adb shell input tap 500 1200
adb shell input text hello
adb shell input keyevent KEYCODE_BACK

# 网络
adb shell ip addr
adb shell settings get global http_proxy
adb exec-out su -c '/system/bin/tcpdump -i any -s 0 -U -w -' > capture.pcap

# 性能
adb shell dumpsys meminfo 包名
adb shell dumpsys gfxinfo 包名
adb shell top -H -p PID
```

---

## 42. 最后建议

把 ADB 当成三类工具使用：

```text
开发工具：安装、启动、日志、性能。
测试工具：自动点击、Monkey、弱网、截图、录屏。
逆向工具：拉包、看进程、看文件、抓包、配合 Frida。
```

真正高效的 ADB 使用方式不是死记命令，而是形成固定排查链路：

```text
设备状态 -> 包信息 -> 当前页面 -> 进程 -> 日志 -> 网络 -> 本地数据 -> 性能 -> 自动化复现
```

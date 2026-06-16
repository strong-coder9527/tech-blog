---
title: PassWall 线路质量测试速查手册
date: 2026-06-05 01:20:00
categories:
  - 运维
  - 软路由
  - PassWall
tags:
  - PassWall
  - OpenWrt
  - 链路测试
  - 故障排查
---

这篇文章整理自工具包里的链路测试文档和 VPN 线路测试记录。原始材料里有真实中转 IP、落地 IP 和业务线路，我在公开版中全部替换成占位符，只保留测试方法和判断标准。

PassWall 线路质量不能只看“能不能打开网页”。真正运维时，要把链路拆开看：本地网络、软路由、代理入口、中转、落地、目标网站，每一段都可能是瓶颈。

## 测试记录模板

每次测试建议按固定模板记录，方便横向比较：

```text
测试日期：
测试方向：
源机器：
目标机器：
链路用途：
协议：
端口：

ping：
  avg：
  mdev：
  packet loss：

mtr：
  丢包开始跳点：
  延迟突增跳点：

iperf3 TCP：
  bitrate：
  retransmits：

iperf3 UDP：
  bitrate：
  jitter：
  lost/total：
  loss rate：

出口 IP：
DNS：
WebRTC：
IPv6：

结论：
下一步：
```

不要只写“很卡”或“能用”。后面回看时，必须能知道是延迟、丢包、带宽、DNS、出口还是协议问题。

## 先拆链路

多跳链路不要一次性看最终结果。

示例：

```text
终端设备
  -> OpenWrt / PassWall
  -> 中转服务器
  -> 落地服务器
  -> 目标网站
```

推荐拆成：

1. 终端到 OpenWrt。
2. OpenWrt 到中转。
3. 中转到落地。
4. 落地到目标网站。
5. PassWall 本地 Socks/HTTP 出口到最终网站。

只看最终网页打开速度，很难判断问题在哪一段。

## 出口 IP 和地区

先确认流量是否真的从目标出口出去：

```bash
PROXY="socks5h://127.0.0.1:1080"

curl -x "$PROXY" -4 https://api.ipify.org
echo
curl -x "$PROXY" -s https://www.cloudflare.com/cdn-cgi/trace | grep -E "ip=|loc="
```

判断：

- 出口 IP 是预期落地：通过。
- 出口 IP 是中转：中转没有正确转发到落地。
- 出口 IP 是本地：PassWall 没走代理或 Socks 配置错误。

测试 DNS 泄露时优先用 `socks5h`，不要用普通 `socks5` 误导判断。

## HTTPS 可用性

基础 HEAD 测试：

```bash
curl -x "$PROXY" -I -s https://example.com | head
```

跟随跳转：

```bash
curl -x "$PROXY" -L -o /dev/null -s -w \
  "code=%{http_code} total=%{time_total} connect=%{time_connect} ttfb=%{time_starttransfer}\n" \
  https://example.com
```

`301`、`302` 不一定是失败，很多网站会正常跳转。重点看最终状态码、连接耗时、首包时间和总耗时。

## 多次请求看抖动

单次请求没有代表性。可以连续测 20 次：

```bash
for i in $(seq 1 20); do
  curl -x "$PROXY" -o /dev/null -s -w "%{time_total}\n" https://example.com
done
```

判断：

- 平均值低，最大值也低：稳定。
- 平均值可以，但偶尔尖峰很高：有抖动。
- 全部都慢：链路整体质量差或目标站慢。

## 并发请求看尖峰

并发比单请求更容易暴露问题：

```bash
seq 1 30 | xargs -I{} -P 10 sh -c \
  'curl -x "$PROXY" -o /dev/null -s -w "%{time_total}\n" https://example.com'
```

注意：不同 shell 对环境变量继承不一样，必要时把 `PROXY` 直接写进命令，或者先 `export PROXY`。

并发测试适合比较不同协议：

- Hysteria2：通常更适合 UDP、语音和实时通讯。
- VLESS Reality：通常适合网页、登录和 TCP 稳定访问。
- HTTP/SOCKS：方便测试，但不代表所有真实协议表现。

## ping / mtr / traceroute

软路由或中转机上测试：

```bash
ping -c 20 目标IP
mtr -rwzc 100 目标IP
traceroute -n 目标IP
```

如果要看 TCP 路径：

```bash
traceroute -T -p 443 目标IP
```

如果要看 UDP 路径：

```bash
traceroute -U 目标IP
```

判断思路：

- 第一跳就丢包：本地网络或上游网关。
- 中间某跳显示丢包但后续不丢：可能是 ICMP 限速，不一定是真丢。
- 从某跳开始后续持续丢包：该段以后可能有问题。
- 延迟突然升高且后续维持：跨境或运营商路径变化。

## iperf3 测带宽和 UDP

目标服务器启动：

```bash
iperf3 -s
```

客户端测 TCP：

```bash
iperf3 -c 目标IP -t 30
```

客户端测 UDP：

```bash
iperf3 -c 目标IP -u -b 5M -t 30
iperf3 -c 目标IP -u -b 10M -t 30
iperf3 -c 目标IP -u -b 20M -t 30
```

重点看：

- `jitter`
- `lost/total`
- `loss rate`

如果 5M UDP 零丢包，但 20M 开始明显丢包，实时协议不要盲目写太高带宽。  
如果指定端口 `Connection refused`，先确认服务监听端口和安全组，而不是直接判定链路失败。

## MTU 测试

某些链路能连但不稳定，可能和 MTU 有关：

```bash
ping -M do -s 1472 目标IP
ping -M do -s 1400 目标IP
ping -M do -s 1350 目标IP
tracepath 目标IP
```

如果大包不通、小包通，需要检查隧道 MTU、MSS clamp、防火墙和中转协议配置。

## OpenWrt / PassWall ACL 检查

当某个设备没有按预期走代理，先看访问控制：

- 设备 IP 是否固定。
- 源地址是否命中。
- TCP/UDP 端口范围是否覆盖。
- 当前节点是否在线。
- 是否启用了本地 Socks/HTTP 测试入口。
- DNS 是否被系统或浏览器绕过。

定点测试：

```bash
TEST_MODE=local_socks \
LOCAL_PROXY_URL=socks5h://127.0.0.1:1080 \
sh /root/passwall_proxy_probe.sh 设备IP
```

## 测试结论怎么写

一条合格结论应该长这样：

```text
结论：
- OpenWrt 到中转 ping 平均 50ms，0% 丢包。
- UDP 10M 测试 0% 丢包，jitter 低。
- 通过 PassWall 本地 Socks 出口访问目标站，20 次请求平均 0.35s，无明显尖峰。
- 出口 IP 和 DNS 地区符合预期。

下一步：
- 保留当前线路为主线。
- 每 30 分钟轻量巡检。
- 夜间跑 3 次 ATTEMPTS + PING_COUNT 的深度诊断。
```

避免这种结论：

```text
感觉还行。
```

运维记录要能复盘、能比较、能指导下一步动作。

## 公开发布前的脱敏清单

这类文章很容易不小心泄露真实网络资产。发布前至少检查：

- 公网 IP 是否需要替换为 `目标IP` 或 `中转IP`。
- 节点账号密码是否出现。
- UUID、Reality 公钥、Short ID 是否出现。
- 订阅链接是否出现。
- 客户线路名称和业务用途是否过细。
- 上报服务器地址和 token 是否出现。

能公开的是方法论、命令模板和判断标准；不该公开的是可直接连接你线路的真实参数。

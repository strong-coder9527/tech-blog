---
title: PassWall 节点巡检与批量检测实践
date: 2026-06-05 01:10:00
categories:
  - 运维
  - 软路由
  - PassWall
tags:
  - PassWall
  - OpenWrt
  - 节点巡检
  - 故障排查
---

这篇文章整理自 `PassWall节点批量检测方案.md`、`passwall_proxy_probe.README.md`、旧版 `passwall_node_test.sh` 和问题记录。原始资料里有两条线：一条是旧版批量测试脚本，一条是后来的自动巡检脚本。整理后可以形成一套更清晰的日常巡检流程。

> 公开版不发布真实节点地址、账号密码、上报服务器和完整私有脚本，只保留可复用的部署方法、诊断逻辑和命令模板。

## 要解决什么问题

PassWall 节点多了以后，单靠后台点 Ping 很难维护。

常见问题包括：

- 节点入口不通。
- 入口能连，但代理出口失败。
- 代理能通，但落地 IP 不符合预期。
- 部分节点慢或抖动。
- 某个内网设备命中的节点有问题。
- HTTP/SOCKS、VLESS、VMess、Trojan、Hysteria2 等协议测试方式不同。

因此需要两类工具：

- 批量节点检测：快速扫一遍所有节点，找出明显坏点。
- 自动巡检：定时记录节点质量，用结果文件追踪抖动。

## 巡检前准备

在 OpenWrt 上确认基础命令可用：

```bash
opkg update
opkg install curl coreutils
```

如果要做 TCP 端口或链路诊断，可按需安装：

```bash
opkg install ip-full bind-tools
```

脚本通常放到 `/root/`：

```bash
scp passwall_proxy_probe.sh root@软路由IP:/root/passwall_proxy_probe.sh
ssh root@软路由IP
chmod +x /root/passwall_proxy_probe.sh
```

## 快速巡检

轻量测试：

```bash
sh /root/passwall_proxy_probe.sh
```

这类模式适合白天低成本巡检。建议默认只测启用 ACL 命中的节点，不要每次扫所有节点，避免影响业务设备。

如果用户反馈某一个内网 IP 很卡，可以只诊断这个 IP：

```bash
sh /root/passwall_proxy_probe.sh 10.10.180.129
```

定点诊断通常会提高尝试次数和 ping 次数，更容易看出抖动：

```bash
ATTEMPTS=3 PING_COUNT=3 sh /root/passwall_proxy_probe.sh 10.10.180.129
```

## 本地 Socks 模式

有些协议不能直接被 `curl -x` 当成普通 HTTP 代理拨号，比如：

- Hysteria2
- VMess
- VLESS
- Trojan

这种情况下可以让 PassWall 自己启动本地 Socks/HTTP 出口，然后脚本只测这个本地出口：

```bash
TEST_MODE=local_socks \
LOCAL_PROXY_URL=socks5h://127.0.0.1:1080 \
sh /root/passwall_proxy_probe.sh 10.10.180.129
```

这里建议用 `socks5h`，因为 `socks5h` 会把 DNS 解析交给代理端。`socks5` 可能在本地解析 DNS，测试 DNS 泄露时容易误判。

## 输出结果怎么看

巡检结果建议写到 `/tmp`，避免频繁写闪存。

常见输出：

```text
/tmp/passwall-probe/latest.csv
/tmp/passwall-probe/latest.jsonl
/tmp/passwall-probe/results.YYYYMMDD-HHMMSS.csv
/tmp/passwall-probe/results.YYYYMMDD-HHMMSS.jsonl
```

CSV 里最有用的字段：

| 字段 | 含义 |
| --- | --- |
| `sources` | 命中的内网 IP 或网段 |
| `node_id` | PassWall 节点 ID |
| `node_remarks` | 节点备注 |
| `protocol/address/port` | 协议和入口 |
| `status` | `OK`、`UNSTABLE`、`FAIL`、`SKIP` |
| `success_rate` | 多次请求成功率 |
| `avg_total` | 平均总耗时 |
| `time_connect` | 连接代理耗时 |
| `time_ttfb` | 首字节耗时 |
| `ping_loss` | 入口 ping 丢包 |
| `exit_ip` | 出口 IP |
| `exit_info` | 出口地理位置和运营商 |

如果结果中包含 `username`、`password`、`auth`，不要直接公开或上传到博客。这些字段只适合本机排障。

## 状态分类

巡检结束时可以按状态处理：

| 状态 | 含义 | 处理优先级 |
| --- | --- | --- |
| `FAIL` | 请求失败、端口不通、超时、服务无响应 | 最高 |
| `UNSTABLE` | 多次测试有成功也有失败 | 高 |
| `SLOW` | 可用但慢 | 中 |
| `VERY_SLOW` | 明显慢 | 中高 |
| `EXIT_QUERY_FAIL` | 主测试成功，但出口查询失败 | 中 |
| `SKIP` | 当前测试方式不支持该协议 | 低，需要换测试模式 |

阈值可以通过环境变量调整：

```bash
SLOW_THRESHOLD=2 \
VERY_SLOW_THRESHOLD=5 \
sh /root/passwall_proxy_probe.sh
```

## 旧版批量测试脚本的适用场景

旧版思路是读取所有节点：

```bash
uci show passwall | grep "=nodes$" | sed 's/^passwall\.//;s/=nodes$//'
```

然后读取每个节点字段：

```bash
uci get passwall.${node_id}.remarks
uci get passwall.${node_id}.address
uci get passwall.${node_id}.port
uci get passwall.${node_id}.username
uci get passwall.${node_id}.password
uci get passwall.${node_id}.protocol
```

再用 `curl -x` 测试：

```bash
proxy_url="http://${username}:${password}@${address}:${port}"
curl -x "$proxy_url" --connect-timeout 8 -s "http://cip.cc"
```

这个思路适合 HTTP 代理节点；对于 Hysteria2、VLESS、VMess 等节点，优先改用本地 Socks 模式。

## 定时任务

白天建议轻量巡检：

```cron
*/30 * * * * ATTEMPTS=1 CONNECT_TIMEOUT=5 MAX_TIME=10 SLEEP_BETWEEN=1 sh /root/passwall_proxy_probe.sh >/tmp/passwall-probe/cron.log 2>&1
```

夜里做深度诊断：

```cron
15 3 * * * ATTEMPTS=3 PING_COUNT=3 CONNECT_TIMEOUT=5 MAX_TIME=12 SLEEP_BETWEEN=1 sh /root/passwall_proxy_probe.sh >/tmp/passwall-probe/nightly.log 2>&1
```

修改后重启 cron：

```bash
/etc/init.d/cron restart
```

## 手动复核模板

如果巡检发现某个 HTTP 代理节点异常，可以手动复核：

```bash
curl -v --connect-timeout 5 --max-time 15 \
  -x http://代理入口IP:端口 \
  --proxy-user 用户名:密码 \
  http://cip.cc
```

备用出口查询：

```bash
curl -v --connect-timeout 5 --max-time 15 \
  -x http://代理入口IP:端口 \
  --proxy-user 用户名:密码 \
  http://ifconfig.me/ip
```

公开文章里不要写真实 `代理入口IP`、`用户名` 和 `密码`。

## 定点诊断时先看本地网络

某个用户反馈“很卡”时，不要只盯节点。先判断本地网络是否抖动：

- 默认网关 ping 是否丢包。
- 软路由直连公网 DNS 是否丢包。
- 软路由直连网页是否慢。
- 软路由到代理入口是否丢包。

如果默认网关和公网 ping 都正常，但代理入口丢包高，问题更可能在“软路由到代理入口”这段。  
如果默认网关就丢包，先查本地网络、上游路由、光猫或运营商线路。

## 巡检原则

- 白天轻量测，夜里深度测。
- 默认按节点去重，避免同一个节点被多个 ACL 重复测试。
- 不用大文件测速 URL 做定时巡检。
- 结果里出现账号密码时，不上传公开仓库。
- 对复杂协议优先测 PassWall 本地 Socks 出口。
- 先分清本地网络问题、代理入口问题、出口落地问题。

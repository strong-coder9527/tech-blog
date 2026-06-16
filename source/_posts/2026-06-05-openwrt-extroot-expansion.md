---
title: OpenWrt 软路由扩容：使用 extroot 挂载 NVMe 硬盘
date: 2026-06-05 00:00:00
categories:
  - 运维
  - 软路由
  - OpenWrt
tags:
  - OpenWrt
  - Extroot
  - 磁盘扩容
---

这篇记录整理自一次 OpenWrt 软路由扩容过程。目标是把新硬盘作为 extroot 使用，让 OpenWrt 的可用空间从默认系统盘扩展到更大的 NVMe 分区。

> 注意：分区、格式化、挂载都会影响磁盘数据。执行前一定要确认设备名和分区号，下面以 `/dev/nvme0n1` 和 `/dev/nvme0n1p3` 为例，实际操作时请替换成你自己的设备。

## 1. 查看磁盘设备

进入 OpenWrt 后台终端或 SSH，先查看当前系统识别到的磁盘设备：

```bash
fdisk -l
```

重点确认新硬盘的设备名，比如这里是 `/dev/nvme0n1`。

![查看 OpenWrt 磁盘设备](/images/openwrt-extroot-expansion/image-20260307091647450.png)

## 2. 使用 cfdisk 创建分区

进入分区工具：

```bash
cfdisk /dev/nvme0n1
```

在 `cfdisk` 中为新硬盘创建需要的分区。保存退出后，系统中通常会出现类似 `/dev/nvme0n1p3` 的分区名。

![进入 cfdisk 分区工具](/images/openwrt-extroot-expansion/image-20260307092054404.png)

## 3. 格式化新分区

对刚创建的新分区进行 ext4 格式化。

```bash
mkfs.ext4 /dev/nvme0n1p3
```

这里必须确认目标是新分区，而不是误操作到已有系统分区。原始记录中的设备名需要按实际环境调整。

![格式化新分区](/images/openwrt-extroot-expansion/image-20260307092411885.png)

## 4. 在 OpenWrt 页面生成挂载配置

回到 OpenWrt 管理后台，进入挂载点相关页面。

![进入挂载点页面](/images/openwrt-extroot-expansion/image-20260307092645482.png)

点击“生成配置”。

![生成挂载配置](/images/openwrt-extroot-expansion/image-20260307092828022.png)

点击左下角“添加”。

![添加挂载点](/images/openwrt-extroot-expansion/image-20260307092921601.png)

选择新建的硬盘分区，并设置为根目录。

![选择新分区作为根目录](/images/openwrt-extroot-expansion/image-20260307093242487.png)

每一步修改后都要点击保存或保存并应用，避免配置没有真正写入。

## 5. 复制根目录数据到新分区

接下来把当前系统根目录内容复制到新分区。下面命令中最关键的是挂载行：

```bash
mount /dev/nvme0n1p3 /tmp/extroot
```

请把 `/dev/nvme0n1p3` 替换为你自己的目标分区。

完整命令如下：

```bash
mkdir -p /tmp/introot
mkdir -p /tmp/extroot
mount --bind / /tmp/introot
mount /dev/nvme0n1p3 /tmp/extroot
tar -C /tmp/introot -cvf - . | tar -C /tmp/extroot -xf -
umount /tmp/introot
umount /tmp/extroot
```

全部粘贴到 SSH 中执行，完成后重启 OpenWrt：

```bash
reboot
```

## 6. 验证扩容结果

重启后回到 OpenWrt 基本信息页，如果 extroot 生效，可以看到可用空间已经变大。

![验证 OpenWrt 扩容结果](/images/openwrt-extroot-expansion/image-20260307094634463.png)

## 操作要点

- `fdisk -l` 用来确认磁盘和分区名称。
- `cfdisk /dev/nvme0n1` 是对整块硬盘做分区管理。
- `mkfs.ext4 /dev/nvme0n1p3` 是格式化具体分区，不要写错设备。
- OpenWrt 页面里的挂载点配置需要保存并应用。
- 复制根目录前要确认 `/tmp/extroot` 挂载的是新分区。
- 重启后再检查系统空间是否扩大。

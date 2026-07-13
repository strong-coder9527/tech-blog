---
title: 站内搜索
date: 2026-07-13 00:00:00
comments: false
toc: false
---

<div class="site-search-page">
  <p class="site-search-lead">搜索文章标题、正文、分类和标签。适合快速定位 OpenWrt、PassWall、Frida、Hermes Agent 等技术笔记。</p>

  <div class="site-search-box">
    <input id="site-search-input" class="site-search-input" type="search" placeholder="输入关键词，例如 PassWall DNS 泄漏" autocomplete="off">
    <button id="site-search-clear" class="site-search-clear" type="button">清空</button>
  </div>

  <div id="site-search-status" class="site-search-status">正在加载索引...</div>
  <div id="site-search-results" class="site-search-results"></div>
</div>

<script src="../js/search.js" defer></script>

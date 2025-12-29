# Bilibili Mind Reclaim (BMR)

> **Memento Mori.**
> 你正在变老，而且你并不确定还能老多久。

BMR 是一个激进的 Tampermonkey 用户脚本，旨在帮助用户从 Bilibili 的算法推荐流中夺回注意力。它通过“默认拒绝”的策略，将 Bilibili 阉割为一个纯粹的**搜索**和**内容消费**工具，而非**时间消磨**平台。

![Memento Overlay Preview](https://raw.githubusercontent.com/gaivrt/G_image_host/main/img/202512292223049.png)

## 核心功能

1.  **首页/非安全区拦截 (Memento Overlay)**
    *   当你试图访问 Bilibili 首页或其他“无脑闲逛”区域时，脚本会强制覆盖一个全屏遮罩。
    *   遮罩显示斯多葛主义 (Stoicism) 的语录，提醒你时间的珍贵。
    *   仅提供必要的入口：**搜索**、**专栏**、**音乐白名单**(其实就是一个跳转链接，我链接到了一个我喜欢的LOFI主的空间)。

2.  **极简主义 UI 清理 (Nuclear CSS)**
    *   移除顶部导航栏的“直播”、“番剧”、“游戏”等诱导性入口。
    *   移除原本右侧的“大会员”图标及相关消费主义链接。
    *   强制修正顶部布局，使其在精简后依然美观。

3.  **智能白名单系统**
    *   脚本并非“一刀切”。正如 Unix 哲学，工具应该是可用的。
    *   允许直接访问：**搜索页**、**视频播放页**、**专栏文章页**、**个人空间**、**消息中心**。
    *   允许访问**白名单内的直播间**和**Opus 动态专栏**。

---

## 安装说明

1.  安装浏览器扩展 [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox)。
2.  创建一个新脚本，将 `BilibiliMindReclaim.js` 的内容完全复制进去。
3.  保存并启用。

---

## 高级自定义 (Customization)

本脚本设计为可高度定制。你可以通过编辑脚本源代码 (`BilibiliMindReclaim.js`) 来调整其行为。以下是详细指南：

### 1. 修改白名单链接 (`CONFIG`)

在脚本开头的 `CONFIG` 常量中，你可以定义专属的入口：

```javascript
const CONFIG = {
    // 允许直接访问的直播间 ID (例如：你的关注列表里唯一值得看的直播)
    whitelistedLiveIds: ['7498212'], 
    
    // 点击遮罩层上 "ATMOSPHERE / 音乐" 按钮跳转的地址
    musicSpaceUrl: 'https://space.bilibili.com/12853451', 
};
```

### 2. 调整“安全区域”判决逻辑 (`isSafeUrl`)

如果你希望放行更多的页面（例如放行“排行榜”或者某个特定分区），请修改 `isSafeUrl` 函数。

**示例：放行“动态”页 (`t.bilibili.com`)**

找到 `isSafeUrl` 函数，添加一行判断：

```javascript
function isSafeUrl(url) {
    if (/^https?:\/\/search\.bilibili\.com\//.test(url)) return true;
    // ... 原有代码 ...
    
    // [新增] 放行动态首页及详情页
    if (/^https?:\/\/t\.bilibili\.com\//.test(url)) return true; 

    // ...
    return false;
}
```

### 3. 自定义斯多葛语录 (`QUOTES`)

你可以删除默认的语录，或者添加你自己喜欢的格言。

```javascript
const QUOTES = [
    { text: "在此刻，我们未来能活三天和活三世没有区别。", author: "马可·奥勒留" },
    // 添加你的语录：
    { text: "多巴胺不是快乐，由于多巴胺分泌的预期才是。", author: "神经科学" },
];
```

### 4. 样式调整 (`NUCLEAR_CSS`)

脚本使用 `NUCLEAR_CSS` 字符串注入全局样式。

*   **修改背景色**：
    如果你不喜欢当前的背景色，可以搜索 `html { background-color: ... }` 和 `#memento-overlay` 进行修改。
    *   `html` 背景：网页加载瞬间的底色。
    *   `#memento-overlay` 背景：遮罩层的底色。

*   **找回“大会员”图标**：
    虽然不建议，但如果你必须保留它，请删除 `/* 2.3 移除“大会员”图标 */` 下面的 CSS 代码。

### 5. 常见问题 FAQ

**Q: 为什么我打开视频详情页也会被拦截？**
A: 正常情况下不会。脚本已经放行了 `www.bilibili.com/video/`。请检查 URL 是否标准，或者是否有特殊的参数干扰了正则匹配。

**Q: 我想彻底屏蔽直播，连白名单都不要。**
A: 在 `isSafeUrl` 中删除关于 `live.bilibili.com` 的判断逻辑即可。

**Q: 如何暂时关闭拦截？**
A: 在 Tampermonkey 扩展菜单中，点击脚本名称前的开关（绿色变为灰色），然后刷新页面即可。

---

## 许可证

MIT License. 
Use it to reclaim your mind.
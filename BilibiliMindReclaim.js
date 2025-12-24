// ==UserScript==
// @name         Bilibili Mind Reclaim
// @namespace    http://tampermonkey.net/
// @version      0.1.10
// @description  Memento Mori. 修复顶部布局塌陷，移除大会员图标。
// @author       you
// @match        *://*.bilibili.com/*
// @run-at       document-start
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        whitelistedLiveIds: ['7498212'],
        musicSpaceUrl: 'https://space.bilibili.com/12853451',
    };

    const QUOTES = [
        { text: "你正在变老，而且你并不确定还能老多久。", author: "斯多葛主义" },
        { text: "死亡不需要预约；它只需要你今天运气差一点。", author: "斯多葛主义" },
        { text: "你不是缺时间，你是在用时间喂养逃避。", author: "斯多葛主义" },
        { text: "别再等“状态好”；你唯一能确定的状态，是终有一天你将彻底没有状态。", author: "斯多葛主义" },
        { text: "即刻行动。不因你准备万全，只因你时日无多。", author: "斯多葛主义" },
        { text: "今天如果是最后一天，你现在这件事值得你把命花在上面吗？", author: "斯多葛主义" },
        { text: "你逃掉的不是任务，是你本可以成为的那个人。", author: "斯多葛主义" },
        { text: "你想要的未来，正在被今天的你亲手葬送。", author: "斯多葛主义" },
        { text: "每一次“算了”，都在教你的大脑：你说的话不算数。", author: "斯多葛主义" },
        { text: "你此刻消磨的，并非只是一个夜晚，而是你此生数三万个夜晚中最珍贵的一个。", author: "斯多葛主义" },
        { text: "你会死；在那之前，别把自己活成一段未完成的草稿。", author: "斯多葛主义" },
        { text: "你随时可能会死亡。<br>让这种可能性决定你的所作、所言、所想。", author: "马可·奥勒留" },
        { text: "想象你已经死去，你的生命已经结束。<br>把剩下的日子当作意外的礼物。", author: "马可·奥勒留" },
        { text: "并不是我们拥有的时间太少，<br>而是我们浪费的时间太多。", author: "塞内卡" },
        { text: "在此刻，我们未来能活三天和活三世没有区别。<br>你失去的只能是当下。", author: "马可·奥勒留" },
        { text: "我们都在等待生活开始，<br>而在等待中，生命已经过去。", author: "塞内卡" },
        { text: "不要表现得好像你可以活一万年。<br>你已时日无多。", author: "马可·奥勒留" }
    ];

    // --- 判决逻辑 ---
    function isSafeUrl(url) {
        if (/^https?:\/\/search\.bilibili\.com\//.test(url)) return true;
        if (url.includes('space.bilibili.com/12853451')) return true;
        if (/^https?:\/\/member\.bilibili\.com\//.test(url)) return true;
        if (/^https?:\/\/message\.bilibili\.com\//.test(url)) return true;
        if (/^https?:\/\/www\.bilibili\.com\/read\//.test(url)) return true;
        if (/^https?:\/\/www\.bilibili\.com\/video\//.test(url)) return true;

        if (/^https?:\/\/live\.bilibili\.com\//.test(url)) {
            const match = url.match(/^https?:\/\/live\.bilibili\.com\/(\d+)/);
            if (match && CONFIG.whitelistedLiveIds.includes(match[1])) return true;
        }
        return false;
    }

    // --- 暴力 CSS ---
    const NUCLEAR_CSS = `
        /* 0. 根元素底色：防止 Body 未加载时的白屏，直接变黑 */
        html { background-color: #0f172a !important; }

        /* 1. 默认拒绝策略：隐藏所有非安全内容 */
        html:not([data-safe="true"]) body > *:not(#memento-overlay) {
            display: none !important;
        }

        /* 2. 垃圾清理 & 布局修复 */

        /* 2.1 隐藏左侧导航 (首页、番剧、直播等) */
        .bili-header .left-entry,
        .bili-header__bar .left-entry,
        .search-header .pages-entry,
        .nav-link-ul,
        .v-popover-wrap--left
        { display: none !important; }

        /* 2.2 布局修复：强制右侧工具栏归位 */
        /* 通过 Flex 布局将剩余内容推到最右边 */
        .bili-header__bar,
        .search-header,
        #biliMainHeader {
            justify-content: flex-end !important;
            width: 100% !important;
        }
        /* 确保右侧容器本身不被压缩 */
        .right-entry {
            margin-left: auto !important;
        }

        /* 2.3 移除“大会员”图标 (消费主义陷阱) */
        /* 匹配 VIP 相关的 class 或包含 big.bilibili.com 链接的元素 */
        .right-entry .vip-wrap,
        .right-entry .header-vip-entry,
        .right-entry a[href*="big.bilibili.com"],
        .mini-vip
        { display: none !important; }

        /* 2.4 其他原有垃圾清理 */
        .bili-search-suggest, .trending, .bili-hotword, .hotword, .ad-report, .feed-card, .promotion,
        .recommend-list, .right-container, .rank-list, .bili-app-recommend, .activity-game-card,
        #reco_list, .recommend-list-v1, .video-page-operator, #right-bottom, .recommend-container,
        .bili-dyn-list, .slide-ad-exp, #slide_ad, .pop-live-small-mode,
        .right-side-bar, .side-toolbar, .related-info-module, .read-more, .reco-list,
        #comment, .bb-comment, #commentapp
        { display: none !important; }

        /* 3. 沉思录遮罩 UI */
        #memento-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 2147483647;
            background-color: #0f172a;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-family: "Georgia", "Songti SC", serif;
            color: #fff;
            opacity: 1;
        }
        #memento-bg {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-size: cover; background-position: center;
            opacity: 0.5; filter: grayscale(50%) contrast(120%);
            z-index: -1; transform: scale(1.05);
            animation: breathe 20s infinite ease-in-out;
        }
        .memento-content {
            position: relative; z-index: 2; text-align: center; max-width: 800px; padding: 20px;
            animation: fadeIn 1s ease-out;
        }
        .m-quote { font-size: 32px; font-weight: bold; line-height: 1.5; margin-bottom: 20px; text-shadow: 0 4px 20px rgba(0,0,0,0.8); }
        .m-author { font-size: 14px; opacity: 0.8; letter-spacing: 2px; margin-bottom: 60px; text-transform: uppercase; }
        .m-actions { display: flex; gap: 30px; justify-content: center; }
        .m-btn {
            padding: 12px 30px; border: 1px solid rgba(255,255,255,0.3);
            color: rgba(255,255,255,0.8); text-decoration: none; text-transform: uppercase;
            letter-spacing: 2px; font-size: 12px; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px);
            transition: all 0.3s;
        }
        .m-btn:hover { background: #fff; color: #000; transform: translateY(-2px); }

        @keyframes breathe { 0% { transform: scale(1.05); } 50% { transform: scale(1.1); } 100% { transform: scale(1.05); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = NUCLEAR_CSS;
    (document.head || document.documentElement).appendChild(styleEl);

    // --- 核心渲染逻辑 ---

    function createOverlayElement() {
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        const bgUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1920&fit=crop";

        const div = document.createElement('div');
        div.id = 'memento-overlay';
        div.innerHTML = `
            <div id="memento-bg" style="background-image: url('${bgUrl}')"></div>
            <div class="memento-content">
                <div class="m-quote">“${q.text}”</div>
                <div class="m-author">— ${q.author} —</div>
                <div class="m-actions">
                    <a href="https://search.bilibili.com" class="m-btn">SEARCH / 工具</a>
                    <a href="${CONFIG.musicSpaceUrl}" class="m-btn">ATMOSPHERE / 音乐</a>
                </div>
            </div>
        `;
        return div;
    }

    function tryAppendOverlay() {
        if (document.getElementById('memento-overlay')) return;

        const overlay = createOverlayElement();

        if (document.body) {
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
        } else {
            const observer = new MutationObserver((mutations, obs) => {
                if (document.body) {
                    document.body.appendChild(overlay);
                    document.body.style.overflow = 'hidden';
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }
    }

    function removeBlocker() {
        const el = document.getElementById('memento-overlay');
        if (el) el.remove();
        if (document.body) document.body.style.overflow = '';
    }

    // --- 哨兵系统 ---
    let currentBlockState = 'unknown';

    function checkStatus() {
        const url = location.href;
        const isSafe = isSafeUrl(url);

        if (isSafe) {
            document.documentElement.setAttribute('data-safe', 'true');
            if (currentBlockState !== 'safe') {
                removeBlocker();
                currentBlockState = 'safe';
            }
        } else {
            document.documentElement.removeAttribute('data-safe');
            if (currentBlockState !== 'blocked' || !document.getElementById('memento-overlay')) {
                tryAppendOverlay();
                currentBlockState = 'blocked';
            }
        }
    }

    checkStatus();
    setInterval(checkStatus, 50);

    window.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            const href = link.href;
            if (href && !isSafeUrl(href)) {
                if(href.startsWith('javascript') || href.includes('#')) return;
                e.preventDefault();
                e.stopPropagation();
                history.pushState(null, '', href);
                checkStatus();
            }
        }
    }, true);

    new MutationObserver(() => {
        if (!document.documentElement.contains(styleEl)) {
            (document.head || document.documentElement).appendChild(styleEl);
        }
    }).observe(document.documentElement, { childList: true, subtree: true });

    console.log('[Mind Reclaim] Layout Fixed & VIP Removed.');
})();

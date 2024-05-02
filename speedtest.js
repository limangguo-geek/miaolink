'use strict';

// 从配置文件中获取网站列表
async function fetchWebsites() {
    try {
        const response = await fetch('config.json', { timeout: 5000 });
        if (!response.ok) {
            throw new Error('Failed to fetch config file');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('网站列表加载失败，请稍后重试。');
        return [];
    }
}

// 检查当前页面 URL 中是否包含 code 参数
function getCodeFromURL() {
    const currentURL = window.location.href;
    const match = currentURL.match(/code=([^&]*)/);
    return match ? match[1] : null;
}

// 过滤可用的网站列表
async function filterAvailableWebsites(websites) {
    const results = await Promise.all(websites.map(async website => {
        try {
            const startTime = performance.now();
            const response = await fetch(website.checkUrl);
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            return response.ok ? { website, time: timeTaken } : null;
        } catch (error) {
            console.error(`Failed to fetch ${website.checkUrl}`, error);
            return null;
        }
    }));
    return results.filter(website => website !== null);
}

// 获取最快的可用网站
function getFastestWebsite(websites) {
    return websites.reduce((fastest, current) => {
        return current.time < fastest.time ? current : fastest;
    });
}

// 构建重定向 URL
function buildRedirectURL(jumpUrl, code) {
    const baseJumpUrl = jumpUrl.endsWith('/') ? jumpUrl.slice(0, -1) : jumpUrl;
    return code ? `${baseJumpUrl}/register?code=${code}` : baseJumpUrl;
}

// 主函数，检查网站速度并重定向
async function checkWebsiteSpeed() {
    try {
        const websites = await fetchWebsites();
        if (websites.length === 0) return;

        const code = getCodeFromURL();
        const availableWebsites = await filterAvailableWebsites(websites);

        if (availableWebsites.length === 0) {
            alert('所有网站都无法访问，请检查网络连接后重试。');
            return;
        }

        const fastestWebsite = getFastestWebsite(availableWebsites);
        const jumpUrl = fastestWebsite ? fastestWebsite.website.jumpUrl : '';

        const newURL = buildRedirectURL(jumpUrl, code);

        window.location.href = newURL;
    } catch (error) {
        console.error(error);
        alert('发生了意外错误，请稍后重试。');
    }
}

// 页面加载完成时执行主函数
window.onload = function() {
    checkWebsiteSpeed();
};

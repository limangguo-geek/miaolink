window.onload = function() {
    // 获取当前页面的 URL 参数
    const queryParams = new URLSearchParams(window.location.search);
    const queryString = queryParams.toString();

    // 从 config.json 文件中获取网站列表
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            const websites = data;
            const requests = websites.map(website => testWebsiteSpeed(website.checkUrl));

            // 并发测试每个网站的响应时间
            Promise.all(requests)
                .then(speeds => {
                    // 找到最快的网站并进行跳转
                    const fastestIndex = speeds.indexOf(Math.min(...speeds));
                    const jumpUrl = websites[fastestIndex].jumpUrl;

                    // 将当前页面的 URL 参数附加到跳转的 URL 上
                    const finalUrl = jumpUrl + (queryString ? '?' + queryString : '');
                    window.location.href = finalUrl; // 跳转到最快的网站
                })
                .catch(error => console.error('Error testing website speeds:', error));
        })
        .catch(error => console.error('Error fetching config.json:', error));

    // 测试单个网站的速度
    function testWebsiteSpeed(url) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            fetch(url, { method: 'HEAD' }) // 使用 HEAD 请求，只获取响应头而不传输整个响应内容，加快测速
                .then(response => {
                    const endTime = performance.now();
                    const speed = endTime - startTime; // 计算响应时间
                    resolve(speed);
                })
                .catch(error => {
                    console.error(`Error testing website speed for ${url}:`, error);
                    resolve(Number.MAX_SAFE_INTEGER); // 将失败的请求记录为非常高的响应时间
                });
        });
    }
};

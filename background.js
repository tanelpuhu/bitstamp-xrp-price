chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.browserAction.setBadgeBackgroundColor({
        color: [255, 0, 0, 255]
    });
    reload_badge();
});

setInterval(reload_badge, 60000);
reload_badge();
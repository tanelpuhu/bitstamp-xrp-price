var get_multiplier = function () {
    return parseFloat(store.get('multiplier') || '1');
},
get_last_value = function() {
    return store.get('last-value');
},
set_last_value = function(value) {
    store.set('last-value', value);
},
reload_badge = function () {
    $.getJSON("https://www.bitstamp.net/api/ticker/", function (data) {
        if (!data && !data.last) {
            return;
        }
        var value = parseFloat(data.last),
            last_value = get_last_value() || value,
            badge_value = value * get_multiplier();
        if(value == last_value) {
            chrome.browserAction.setBadgeBackgroundColor({
                color: [0, 0, 0, 150]
            });
        } else if(value > last_value) {
            chrome.browserAction.setBadgeBackgroundColor({
                color: [0, 150, 0, 150]
            });
        } else {
            chrome.browserAction.setBadgeBackgroundColor({
                color: [255, 0, 0, 255]
            });
        }

        chrome.browserAction.setTitle({
            'title': '1 BTC = ' + value.toFixed(2) + ' USD'
        });
        chrome.browserAction.setBadgeText({
            'text': badge_value.toFixed(1)
        });
        set_last_value(value);
    });
},
save_options = function () {
    var multiplier = $('#multiplier').val();
    store.set('multiplier', multiplier || '1');
    reload_badge();
},
load_options = function () {
    $('#save').on('click', save_options);
    $('#multiplier').val(get_multiplier());
},
background = function () {
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.browserAction.setBadgeBackgroundColor({
            color: [255, 0, 0, 255]
        });
        chrome.browserAction.setBadgeText({
            'text': '...'
        });
        reload_badge();
    });
    setInterval(reload_badge, 60000);
    reload_badge();
};

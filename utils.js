var get_multiplier = function() {
        return parseFloat(localStorage.multiplier || '1');
    },
    load_options = function(){
        console.log('setBadgeText')
        $('#save').on('click', save_options);
        $('#multiplier').val(get_multiplier());
    },
    save_options = function() {
        var multiplier = $('#multiplier').val();
        localStorage.multiplier = multiplier || '1';
        reload_badge();
    },
    reload_badge = function () {
        chrome.browserAction.setBadgeText({
            'text': '...'
        });
        $.getJSON("https://www.bitstamp.net/api/ticker/", function (data) {
            if (!data && !data.last) {
                return;
            }
            var value = parseFloat(data.last) * get_multiplier();
            chrome.browserAction.setBadgeBackgroundColor({
                color: [0, 0, 0, 255]
            });
            chrome.browserAction.setBadgeText({
                'text': value.toFixed(2)
            });
        });
    };



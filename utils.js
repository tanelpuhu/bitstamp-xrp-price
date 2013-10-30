var last_values = [],
notify = function (title, msg) {
    return chrome.notifications.create('', {
        type: "basic",
        title: title,
        message: msg,
        iconUrl: "icon.png"
    }, function (notifid) {});
},
get_multiplier = function () {
    var value = store.get('multiplier');
    if (value === undefined) {
        return 1;
    }
    return value;
},
set_multiplier = function (value) {
    value = parseFloat(value);
    if (isNaN(value)) {
        value = 1;
    }
    store.set('multiplier', value);
},
get_last_value = function () {
    return store.get('last-value');
},
set_last_value = function (value) {
    store.set('last-value', value);
},
get_precision = function () {
    var value = store.get('precision');
    if (value === undefined) {
        return 1;
    }
    return value;
},
set_precision = function (value) {
    value = parseInt(value, 10);
    if (isNaN(value)) {
        value = 1;
    }
    store.set('precision', value);
},
reload_badge = function (manual) {
    $.getJSON("https://www.bitstamp.net/api/ticker/", function (data) {
        if (!data && !data.last) {
            return;
        }
        var value = parseFloat(data.last),
            last_value = get_last_value() || value,
            last_max = store.get('last-max') || value,
            last_min = store.get('last-min') || value,
            badge_value = value * get_multiplier();
        if (value == last_value) {
            chrome.browserAction.setBadgeBackgroundColor({
                color: [0, 0, 0, 150]
            });
        } else if (value > last_value) {
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
            'text': badge_value.toFixed(get_precision())
        });
        set_last_value(value);
        if (store.get('notification-max') && value > last_max) {
            store.set('last-max', value);
            notify('New maximum BTC price', 'The highest price is now ' + value);
            $('#last_max').val(value);
        }
        if (store.get('notification-min') && value < last_min) {
            store.set('last-min', value);
            notify('New minimum BTC price', 'The lowest price is now ' + value);
            $('#last_min').val(value);
        }
        if (store.get('notification-diff') && store.get('last-diff')) {
            last_values.push(value);
            if (last_values.length > 10) {
                last_values.shift();
            }
            var max = Math.max.apply(Math, last_values),
                min = Math.min.apply(Math, last_values),
                abs = Math.round(Math.abs(max - min) * 100) / 100;
            if (abs > store.get('last-diff')) {
                notify(
                    'Price change more than ' + store.get('last-diff'),
                    'Within 10 fetches price has changed ' + abs + ' USD. Current price is: ' + value);
            }
        }

    });
},
save_options = function () {
    var multiplier = $('#multiplier').val(),
        precision = $('#precision option:selected').val();
    set_multiplier(multiplier);
    set_precision(precision);
    $('input[type=checkbox]').each(function () {
        var elem = $(this),
            id = elem.attr('id'),
            checked = elem.prop('checked');
        store.set(id, checked);
    });
    store.set('last-max', parseFloat($('#last_max').val()) || get_last_value());
    store.set('last-min', parseFloat($('#last_min').val()) || get_last_value());
    store.set('last-diff', parseFloat($('#last_diff').val()) || 5);

    reload_badge(1);
},
load_options = function () {
    $('#multiplier').val(get_multiplier());
    $('#precision option[value=' + get_precision() + ']').prop('selected', true);
    $('input[type=checkbox]').each(function () {
        var elem = $(this),
            id = elem.attr('id'),
            checked = store.get(id);
        elem.prop('checked', checked);
    });
    $('#last_max').val(store.get('last-max') || get_last_value());
    $('#last_min').val(store.get('last-min') || get_last_value());
    $('#last_diff').val(store.get('last-diff') || 5);
    $('#save').on('click', save_options);
},
background = function () {
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.browserAction.setBadgeBackgroundColor({
            color: [255, 0, 0, 255]
        });
        chrome.browserAction.setBadgeText({
            'text': '...'
        });
        reload_badge(1);
    });
    setInterval(reload_badge, 60000);
    reload_badge();
};

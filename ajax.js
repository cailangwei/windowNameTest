/*global document:false, location:false */

var ajax = ajax || {};

ajax.byWindowName = function (url, data, callback, opt_option) {
    // option
    var option = opt_option || {};
    option['method'] = option['method'] || 'POST';
    option['encoding'] = option['encoding'] || 'UTF-8';
    option['proxy'] = option['proxy'] || 'blank.html';
    if (option['proxy'].indexOf('http') !== 0) {
        option['proxy'] =
            location.protocol + '//' + location.host + '/' + option['proxy'];
    }

    // create form
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // create form
    var formHtml = '';
    /**
     * create input and append to form
     *
     * @param {string} key .
     * @param {boolean|string|number} value .
     */
    function appendInput (key, value) {
        if (value == null) {
            return;
        }

        formHtml += ''
            + '<input type="text"'
            + 'name="' + key + '"'
            + 'value="' + value.toString() + '"';
    }
    for (var key in data) {
        var value = data[key];
        if (baidu.lang.isArray(value)) {
            key += '[]';
            for (var i = 0, l = value.length; i < l; i++) {
                appendInput(key, value[i]);
            }
        }
        else {
            appendInput(key, value);
        }
    }

    formHtml = ''
        + '<!DOCTYPE html>'
        + '<html lang="en">'
        + '<head>'
        +     '<meta charset="' + option['encoding'] + '">'
        +     '<title></title>'
        + '</head>'
        + '<body>'
        +     '<form '
        +         'action="' + url + '" '
        +         'method="' + option['method'] + '" '
        +         'enctype="application/x-www-form-urlencoded">'
        +         formHtml
        +     '</form>'
        + '</body>'
        + '</html>';

    var iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(formHtml);
    iframeDoc.close();
    var form = iframeDoc.getElementsByTagName('form')[0];

    // bind on load
    var flag = false;
    var onload = function() {
        if (flag) {
            var win = iframe.contentWindow;
            var data;
            try {
                // 避免因为url访问不到而报错
                data = win.name;
            } catch(e) {
                data = '';
            }
            callback(data);

            // unbind onload event
            if (iframe.detachEvent) {
                iframe.detachEvent('onload', onload);
            }
            else {
                iframe.onload = null;
            }

            // clear and remove dom
            try {
                // 避免proxy页面访问不到而在IE下报错
                iframeDoc.write('');
                win.close();
                iframe.parentNode.removeChild(iframe);
            } catch(e) {}
        }
        else {
            flag = true;
            iframe.contentWindow.location = option['proxy'];
        }
    };

    // attach onload event
    if (iframe.attachEvent) {
        // must use attachEvent on IE
        // or onload event won't fire twice.
        iframe.attachEvent('onload', onload);
    }
    else {
        iframe.onload = onload;
    }

    // submit
    form.submit();
};

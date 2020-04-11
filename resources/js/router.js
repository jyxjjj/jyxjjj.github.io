/**
 * @copyright Copyright='DESMG(www.desmg.com) All Rigths Reserved.'; QQ=773933146; Telegram=jyxjjj(https://t.me/jyxjjj); Producer=DESMG
 * @version 1.0.0
 * @file BlogRouter By DESMG.
 * @license GNU General Public License v3.0
 * @author DESMG
 */
;(function ($) {
    if (!$) {
        console.error("jQuery required.");
    }
    $.Router = {};
    let _this = $.Router;
    _this.config = {
        protocol: 'https://',
        domain: window.location.hostname,
        port: 443,
        view: 'body',
        default: 'index',
        routers: {
            index: {
                method: 'get',
                templateUrl: '/list.html',
            }
        }
    };
    _this.onEvent = function () {
        let targetRouter = window.location.hash.split('!')[1];
        let target, method, data;
        try {
            target = _this.config.routers[targetRouter].templateUrl;
        } catch (e) {
            target = _this.config.routers[_this.config.default].templateUrl;
        }
        try {
            method = _this.config.routers[targetRouter].method;
        } catch (e) {
            method = _this.config.routers[_this.config.default].method;
        } finally {
            method = 'get';
        }
        try {
            data = _this.config.routers[targetRouter].data;
        } catch (e) {
            data = _this.config.routers[_this.config.default].data;
        } finally {
            data = '';
        }
        $.ajax({
            type: method,
            url: _this.config.protocol + _this.config.domain + ':' + _this.config.port + target,
            data: data,
            dataType: 'html',
            success: function (data) {
                $(_this.config.view).html(data);
            }
        });
    };
    _this.init = function (config = null) {
        if (config != null) {
            _this.config = config;
        }
        _this.onEvent();
    };
    $(window).on('hashchange', _this.onEvent);
})(jQuery);
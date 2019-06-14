/**
 * @copyright Copyright='DESMG(www.desmg.com) All Rigths Reserved.'; QQ=773933146; Phone=18251554183; Producer=DESMG
 * @version 1.0.0
 * @file Show HTML5 Notification By DESMG.
 * @license GNU General Public License v3.0
 * @author DESMG
 */
;(function ($) {
    if (!$) {
        console.error("jQuery required.");
    }
    if (!$.desmg) {
        $.desmg = {};
    }
    let desmg = $.desmg;
    desmg.notification = {};
    let _this = desmg.notification;
    _this.getPermission = function () {
        if (typeof Notification != "function") {
            console.error("Unsupported Notification");
            return false;
        } else {
            if (Notification.permission === "default") {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        return true;
                    } else if (permission === "denied") {
                        console.warn("User refused Notification.");
                        return false;
                    }
                });
            } else if (Notification.permission === "denied") {
                console.warn("User refused Notification.");
                return false;
            } else if (Notification.permission === "granted") {
                return true;
            }
        }
    };
    _this.note = function (title, options) {
        return new Notification(title, options);
    };
    _this.getPermission();
})(jQuery);
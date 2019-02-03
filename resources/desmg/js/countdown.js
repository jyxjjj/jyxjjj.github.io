/**
 * @copyright Copyright='DESMG(www.desmg.com) All Rigths Reserved.'; QQ=773933146; Phone=18251554183; Producer=DESMG
 * @version 1.0.0
 * @file CountDown Time By DESMG.
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
    desmg.countdown = {};
    let _this = desmg.countdown;
    _this.format = {};
    _this.format.colon = 1;
    _this.format.zh_CN = 2;
    _this.format.en_US = 3;
    _this.current = function () {
        let date = new Date();
        let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 8));
    };
    _this.init = function (dom, time1, downcount = true, format = _this.format.colon) {
        time1 = new Date(time1);
        setInterval(function () {
            let time2 = _this.current();
            let diff;
            if (downcount) {
                diff = time1 - time2;
            } else {
                diff = time2 - time1
            }
            diff = diff / 1000;
            let days, remain, hours, mins, secs;
            days = parseInt(diff / 86400);
            remain = diff % 86400;
            hours = parseInt(remain / 3600);
            remain = remain % 3600;
            mins = parseInt(remain / 60);
            secs = parseInt(remain % 60);
            if (hours.toString().length === 1) {
                hours = "0" + hours;
            }
            if (mins.toString().length === 1) {
                mins = "0" + mins;
            }
            if (secs.toString().length === 1) {
                secs = "0" + secs;
            }
            if (format === _this.format.colon) {
                dom.text(days + "." + hours + ":" + mins + ":" + secs);
            }
            if (format === _this.format.zh_CN) {
                dom.text(days + "天" + hours + "时" + mins + "分" + secs + "秒");
            }
            if (format === _this.format.en_US) {
                dom.text(days + " Days " + hours + " Hours " + mins + " Minutes " + secs + " Seconds");
            }
        }, 1000);
    };
    _this.initDoms = function (dom_day, dom_hour, dom_min, dom_sec, time1, downcount = true) {
        time1 = new Date(time1);
        setInterval(function () {
            let time2 = _this.current();
            let diff;
            if (downcount) {
                diff = time1 - time2;
            } else {
                diff = time2 - time1
            }
            diff = diff / 1000;
            let days, remain, hours, mins, secs;
            days = parseInt(diff / 86400);
            remain = diff % 86400;
            hours = parseInt(remain / 3600);
            remain = remain % 3600;
            mins = parseInt(remain / 60);
            secs = parseInt(remain % 60);
            if (hours.toString().length === 1) {
                hours = "0" + hours;
            }
            if (mins.toString().length === 1) {
                mins = "0" + mins;
            }
            if (secs.toString().length === 1) {
                secs = "0" + secs;
            }
            dom_day.text(days);
            dom_hour.text(hours);
            dom_min.text(mins);
            dom_sec.text(secs);
        }, 1000);
    };
})(jQuery);
/**
 * @copyright Copyright='DESMG(www.desmg.com) All Rigths Reserved.'; QQ=773933146; Telegram=jyxjjj(https://t.me/jyxjjj); Producer=DESMG
 * @version 1.0.0
 * @file CountDown Time by DESMG.
 * @license GNU Affero General Public License v3.0
 * @author DESMG
 */
;(
    $ => {
        /**
         * @param {function} callback
         * @param {number} delay
         */
        function setIntervalWithRequestAnimationFrame(callback, delay) {
            let start = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - start;
                if (elapsed >= delay) {
                    callback();
                    start = currentTime;
                }
                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);
        }

        /**
         * @param {Date} time
         * @param {boolean} downcount
         */
        function cacl(time, downcount = true) {
            const time1 = time;
            const time2 = (date => new Date(date.getTime() + (date.getTimezoneOffset() * 60000) + (3600000 * 8)))(new Date);
            const diff = (downcount ? time1 - time2 : time2 - time1) / 1000;
            let days, hours, mins, secs, remain;
            days = Math.trunc(diff / 86400);
            remain = diff % 86400;
            hours = Math.trunc(remain / 3600);
            remain = remain % 3600;
            mins = Math.trunc(remain / 60);
            secs = Math.trunc(remain % 60);
            hours = hours.toString().padStart(2, "0");
            mins = mins.toString().padStart(2, "0");
            secs = secs.toString().padStart(2, "0");
            if (isNaN(days) || isNaN(hours) || isNaN(mins) || isNaN(secs)) {
                return [0, 0, 0, 0];
            }
            return [days, hours, mins, secs];
        }

        /**
         * @param {jQuery} dom_day
         * @param {jQuery} dom_hour
         * @param {jQuery} dom_min
         * @param {jQuery} dom_sec
         * @param {string} time
         * @param {boolean} downcount
         */
        function splitable(dom_day, dom_hour, dom_min, dom_sec, time, downcount = true) {
            const time1 = new Date(time);
            setIntervalWithRequestAnimationFrame(_ => {
                let [days, hours, mins, secs] = cacl(time1, downcount);
                // noinspection JSUnresolvedReference
                dom_day.text(days) && dom_hour.text(hours) && dom_min.text(mins) && dom_sec.text(secs);
            }, 1000);
        }

        /**
         * @param {jQuery} dom
         * @param {string} time
         * @param {boolean} downcount
         * @param {string} format
         */
        function elementable(dom, time, downcount = true, format = 'colon') {
            const time1 = new Date(time);
            setIntervalWithRequestAnimationFrame(_ => {
                let [days, hours, mins, secs] = cacl(time1, downcount);
                // noinspection JSUnresolvedReference
                format === 'colon' && dom.text(days + "." + hours + ":" + mins + ":" + secs);
                // noinspection JSUnresolvedReference
                format === 'zh_CN' && dom.text(days + "\u5929" + hours + "\u65f6" + mins + "\u5206" + secs + "\u79d2");
                // noinspection JSUnresolvedReference
                format === 'en_US' && dom.text(days + " Days " + hours + " Hours " + mins + " Minutes " + secs + " Seconds");
            }, 1000);
        }

        if (!$) {
            console.error('jQuery required.');
            return;
        }
        !$.desmg && ($.desmg = {});
        // noinspection JSUnusedGlobalSymbols
        $.desmg.countdown = {cacl, splitable, elementable};
    }
)(jQuery);

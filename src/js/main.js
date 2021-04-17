'use strict';

document.addEventListener('DOMContentLoaded', function () {

    console.log('May the Force be with you');

    function initEmailSub() {
        new JustValidate('.js-form-subscribe', {
            rules: {
                phone: {
                    required: true,
                }
            },
            messages: {
                phone:
                    'Invalid phone',
            },
            submitHandler: function (form, values, ajax) {
                subscribeUser(ajax, values);
            }
        });
    }

    function subscribeUser(ajax, values) {
        values.phone = cleanPhone(values.phone);
        ajax({
            url: window.urlSubscribe,
            method: 'POST',
            async: true,
            data: 'data=' + JSON.stringify(values),
            callback: function (resp) {
                if (resp === 'OK') {
                    location.href = window.urlPrediction;
                } else {
                    alert('Oops! Something went wrong… try again later.');
                }
            }
        });
    }
});

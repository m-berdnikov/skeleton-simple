'use strict';

document.addEventListener('DOMContentLoaded', function () {

    let form = document.querySelector('.js-form-subscribe');

    form && window.urlSubscribe && window.urlRedirect && initEmailSub();
    form && createMask();

    // Creating the mask
    function createMask() {
        let elements = document.getElementsByClassName('js-subscribe-input');
        for (let i = 0; i < elements.length; i++) {
            new IMask(elements[i], {
                mask: '+1(000)000-0000',
            });
        }
    }

    // Cleaning the phone value
    function cleanPhone(phone) {
        phone = phone.replace('(', '');
        phone = phone.replace(')', '');
        phone = phone.replace('-', '');
        phone = phone.replace('+1', '');
        return phone;
    }

    // Validating the form
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

    // Sending subscribe request
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

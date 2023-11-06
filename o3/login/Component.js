/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
        'sap/ui/core/UIComponent',
    ],
    function (UIComponent) {
        'use strict';

        return UIComponent.extend('o3.login.Component', {
            metadata: {
                manifest: 'json'
            },
            init: function () {
                var that = this;

                // call the init function of the parent
                UIComponent.prototype.init.apply(that, arguments);
            }
        });
    });

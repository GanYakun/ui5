sap.ui.define([
    'sap/m/Input',
], function (Input) {
    "use strict";
    var _Input = Input.extend('o3.library.control.smart.test.Input', {
        metadata: {
            properties: {
                myProperty: { type: 'string' }
            }
        },
        init: function () {
            Input.prototype.init.apply(this, arguments);

            // 根据value的值，设置自定义的property
            this.attachChange((oEvent) => {
                let sValue = oEvent.getSource().getValue();
                oEvent.getSource().setMyProperty(sValue);
            })
        },
        renderer: function (oRm, oControl) {
            sap.m.InputRenderer.render(oRm, oControl);
        }
    });

    return _Input;
});
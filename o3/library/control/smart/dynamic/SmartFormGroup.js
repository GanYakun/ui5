sap.ui.define([
    'sap/m/VBox'
], function (VBox) {
    "use strict";

    var SmartFormGroup = VBox.extend("o3.library.control.smart.dynamic.SmartFormGroup", {
        metadata: {
            library: "sap.ui.comp",
            properties: {
                title: { type: "string", group: "Misc" },
                fields: { type: "string", group: "Misc" }
            },
            defaultAggregation: "smartformgroup",
            aggregations: {
                smartformgroup: { type: "sap.m.VBox", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2
        },
        constructor: function () {
            VBox.apply(this, arguments);
        }
    });

    return SmartFormGroup;
});
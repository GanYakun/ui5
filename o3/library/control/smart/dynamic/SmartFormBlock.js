sap.ui.define([
    'sap/m/VBox'
], function (VBox) {
    "use strict";

    var SmartFormBlock = VBox.extend("o3.library.control.smart.dynamic.SmartFormBlock", {
        metadata: {
            library: "sap.ui.comp",
            properties: {
                entitySet: { type: "string", group: "Misc" },
                title: { type: "string", group: "Misc" },
                editable: { type: "boolean", group: "Misc", defaultValue: false },
                editTogglable: { type: "boolean", group: "Misc", defaultValue: true },
                editToggled: { type: "string", group: "Misc" }
            },
            defaultAggregation: "smartformgroup",
            aggregations: {
                smartformgroup: { type: "o3.library.control.smart.dynamic.SmartFormGroup", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2
        },
        constructor: function () {
            VBox.apply(this, arguments);
        }
    });

    return SmartFormBlock;
});
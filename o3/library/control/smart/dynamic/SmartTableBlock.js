sap.ui.define([
    'sap/m/VBox'
], function (VBox) {
    "use strict";

    var SmartTableBlock = VBox.extend("o3.library.control.smart.dynamic.SmartTableBlock", {
        metadata: {
            library: "sap.ui.comp",
            properties: {
                header: { type: "string", group: "Misc" },
                navgationProperty: { type: "string", group: "Misc" },
                useNavigation: { type: "boolean", group: "Misc", defaultValue: false },
                editTogglable: { type: "boolean", group: "Misc", defaultValue: true },
                editToggled: { type: "string", group: "Misc" },
                columnItemPress: { type: "string", group: "Misc" },
                quickCreatable: { type: "boolean", group: "Misc", defaultValue: true },
                mode: { type: "string", group: "Misc", defaultValue: "MultiSelect" },
                deletable: { type: "boolean", group: "Misc", defaultValue: true },
                initiallyVisibleFields: { type: "string", group: "Misc" }
            },
            defaultAggregation: "smarttableblock",
            aggregations: {
                smarttableblock: { type: "sap.m.VBox", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2
        },
        constructor: function () {
            VBox.apply(this, arguments);
        }
    });

    return SmartTableBlock;
});
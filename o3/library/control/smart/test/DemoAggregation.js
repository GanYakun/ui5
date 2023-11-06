sap.ui.define([
    'sap/m/VBox'
], function (VBox) {
    "use strict";

    var DemoAggregation = VBox.extend("o3.library.control.smart.test.DemoAggregation",
        {
            metadata: {
                library: "sap.ui.comp",
                properties: {
                },
                defaultAggregation: "items",
                aggregations: {
                    // 默认aggregation
                    items: { type: "sap.ui.core.Control", multiple: true, singularName: "item" },
                    // 一对多的聚合，即customToolbar下能放多个control
                    customToolbar: { type: "sap.ui.core.Control", multiple: true },
                    // 一对一的聚合，即footer下只能放一个control
                    footer: { type: "sap.ui.core.Control", multiple: false }
                }
            },
            renderer: {
                apiVersion: 2
            },
            constructor: function () {
                VBox.apply(this, arguments);
                this.createContent();
            }
        });

    DemoAggregation.prototype.init = function () {
        VBox.prototype.init.call(this);
    };

    DemoAggregation.prototype.createContent = function () {
        let oCustomToolbar = this.getAggregation("customToolbar");
        let oFooter = this.getAggregation("footer");

        oCustomToolbar.forEach(element => {
            this.addItem(element);
        });

        this.addItem(oFooter);
    };

    return DemoAggregation;
});
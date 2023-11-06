sap.ui.define([
    "sap/uxap/ObjectPageSection"
], function (ObjectPageSection) {
    "use strict";

    var SmartBaseSection = ObjectPageSection.extend("o3.library.control.smart.dynamic.SmartBaseSection", {
        metadata: {
            library: "sap.uxap",
            properties: {
                titleUppercase: {type: "boolean", group: "Appearance", defaultValue: false}
            },
            defaultAggregation: "subSections",
            aggregations: {
                subSections: { type: "o3.library.control.smart.dynamic.SmartSubSection", multiple: true, singularName: "subSection" }
            }
        },
        renderer: function (oRm, oControl) {
            sap.uxap.ObjectPageSectionRenderer.render(oRm, oControl);
        }
    });
    return SmartBaseSection;
});
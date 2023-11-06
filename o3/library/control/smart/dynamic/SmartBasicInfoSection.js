sap.ui.define([
    "o3/library/control/smart/dynamic/SmartBaseSection"
], function (SmartBaseSection) {
    "use strict";

    var _SmartBasicInfoSection = SmartBaseSection.extend("o3.library.control.smart.dynamic.SmartBasicInfoSection", {
        metadata: {
            library: "sap.uxap",
            properties: {
                title: { type: "string", group: "Misc" }
            },
            defaultAggregation: "subSections",
            aggregations: {
                subSections: { type: "o3.library.control.smart.dynamic.SmartSubSection", multiple: true }
            }
        },
        renderer: function (oRm, oControl) {
            sap.uxap.ObjectPageSectionRenderer.render(oRm, oControl);
        }
    });
    return _SmartBasicInfoSection;
});
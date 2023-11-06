sap.ui.define([
    "sap/uxap/ObjectPageSubSection"
], function (ObjectPageSubSection) {
    "use strict";

    var SmartSubSection = ObjectPageSubSection.extend("o3.library.control.smart.dynamic.SmartSubSection", {
        metadata: {
            properties: {
            }
        },
        renderer: function (oRm, oControl) {
            sap.uxap.ObjectPageSubSectionRenderer.render(oRm, oControl);
        }
    });
    return SmartSubSection;
});
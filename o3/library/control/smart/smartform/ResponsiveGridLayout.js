sap.ui.define([
    "sap/ui/layout/form/ResponsiveGridLayout",
    "sap/ui/layout/form/ResponsiveGridLayoutRenderer"
], function (ResponsiveGridLayout, ResponsiveGridLayoutRenderer) {
    "use strict";

    var _ResponsiveGridLayout = ResponsiveGridLayout.extend("o3.library.control.smart.smartform.ResponsiveGridLayout", {
        metadata: {
        },
        renderer: function (oRm, oControl) {
            ResponsiveGridLayoutRenderer.render(oRm, oControl);
        }
    });
    return _ResponsiveGridLayout;
});
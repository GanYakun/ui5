sap.ui.define([
    "sap/ui/layout/form/ColumnLayout",
    "sap/ui/layout/form/ColumnLayoutRenderer"
], function (ColumnLayout, ColumnLayoutRenderer) {
    "use strict";

    var _ColumnLayout = ColumnLayout.extend("o3.library.control.smart.smartform.ColumnLayout", {
        metadata: {
        },
        renderer: function (oRm, oControl) {
            ColumnLayoutRenderer.render(oRm, oControl);
        }
    });
    return _ColumnLayout;
});
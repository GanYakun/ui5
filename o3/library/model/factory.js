//Factory Definition
sap.ui.define([
    'sap/m/VBox',
    'sap/m/ObjectAttribute'
], function (VBox, ObjectAttribute) {
    "use strict";

    var FactoryDefinition = {
        formatTraking: function (id, context) {
            var vVBox = new VBox();
            vVBox.addItem(new ObjectAttribute({
                title: context.getProperty("carrierPartyId"),
                text: context.getProperty("trackingIdNumber")
            }));

            return vVBox;
        }
    };

    return FactoryDefinition;

}, true);
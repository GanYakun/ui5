sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var AdditionalCustomListReportDefinition = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.banfftech.requirementmanagebyprocurement',
            componentId: 'CGProductRequirementsList',
            entitySet: 'CGProductRequirements'
        },
        AdditionalCustomListReportDefinition
    );
});
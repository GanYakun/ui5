sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var AdditionalCustomListReportDefinition = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.banfftech.uilabappmanage',
            componentId: 'UILabAppsList',
            entitySet: 'UILabApps'
        },
        AdditionalCustomListReportDefinition
    );
});
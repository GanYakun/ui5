sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.banfftech.approvalmanage',
            componentId: 'ApprovalsObjectPage',
            entitySet: 'Approvals'
        },
        CustomPageDefinitions
    );
});
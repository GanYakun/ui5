sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/purchaseagreementmanage/test/integration/pages/MainListReport' ,
        'com/banfftech/purchaseagreementmanage/test/integration/pages/MainObjectPage',
        'com/banfftech/purchaseagreementmanage/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/purchaseagreementmanage') + '/index.html'
        });

        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
    }
);
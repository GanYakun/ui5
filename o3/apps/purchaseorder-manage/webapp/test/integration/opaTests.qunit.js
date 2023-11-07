sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/purchaseordermanage/test/integration/FirstJourney',
		'com/banfftech/purchaseordermanage/test/integration/pages/PurchaseOrderHeadersList',
		'com/banfftech/purchaseordermanage/test/integration/pages/PurchaseOrderHeadersObjectPage'
    ],
    function(JourneyRunner, opaJourney, PurchaseOrderHeadersList, PurchaseOrderHeadersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/purchaseordermanage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePurchaseOrderHeadersList: PurchaseOrderHeadersList,
					onThePurchaseOrderHeadersObjectPage: PurchaseOrderHeadersObjectPage
                }
            },
            opaJourney.run
        );
    }
);
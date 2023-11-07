sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/paymentmanage/test/integration/FirstJourney',
		'com/banfftech/paymentmanage/test/integration/pages/PaymentsList',
		'com/banfftech/paymentmanage/test/integration/pages/PaymentsObjectPage'
    ],
    function(JourneyRunner, opaJourney, PaymentsList, PaymentsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/paymentmanage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePaymentsList: PaymentsList,
					onThePaymentsObjectPage: PaymentsObjectPage
                }
            },
            opaJourney.run
        );
    }
);
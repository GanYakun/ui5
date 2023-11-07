sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/invoicemanage/test/integration/FirstJourney',
		'com/banfftech/invoicemanage/test/integration/pages/InvoicesList',
		'com/banfftech/invoicemanage/test/integration/pages/InvoicesObjectPage'
    ],
    function(JourneyRunner, opaJourney, InvoicesList, InvoicesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/invoicemanage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheInvoicesList: InvoicesList,
					onTheInvoicesObjectPage: InvoicesObjectPage
                }
            },
            opaJourney.run
        );
    }
);
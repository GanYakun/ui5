sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/supplierpartymanage/test/integration/FirstJourney',
		'com/banfftech/supplierpartymanage/test/integration/pages/SupplierPartiesList',
		'com/banfftech/supplierpartymanage/test/integration/pages/SupplierPartiesObjectPage'
    ],
    function(JourneyRunner, opaJourney, SupplierPartiesList, SupplierPartiesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/supplierpartymanage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSupplierPartiesList: SupplierPartiesList,
					onTheSupplierPartiesObjectPage: SupplierPartiesObjectPage
                }
            },
            opaJourney.run
        );
    }
);
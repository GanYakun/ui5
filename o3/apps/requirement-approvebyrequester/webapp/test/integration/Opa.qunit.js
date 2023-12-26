sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/requirementapprovebyrequester/test/integration/pages/MainListReport' ,
        'com/banfftech/requirementapprovebyrequester/test/integration/pages/MainObjectPage',
        'com/banfftech/requirementapprovebyrequester/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/requirementapprovebyrequester') + '/index.html'
        });

        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
    }
);
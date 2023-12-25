sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/requirementmanagebyprocurement/test/integration/pages/MainListReport' ,
        'com/banfftech/requirementmanagebyprocurement/test/integration/pages/MainObjectPage',
        'com/banfftech/requirementmanagebyprocurement/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/requirementmanagebyprocurement') + '/index.html'
        });

        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
    }
);
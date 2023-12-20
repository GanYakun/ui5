sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/catalogrequest/test/integration/pages/MainListReport' ,
        'com/banfftech/catalogrequest/test/integration/pages/MainObjectPage',
        'com/banfftech/catalogrequest/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/catalogrequest') + '/index.html'
        });

        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
    }
);
sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/processentitymanage/test/integration/pages/MainListReport' ,
        'com/banfftech/processentitymanage/test/integration/pages/MainObjectPage',
        'com/banfftech/processentitymanage/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/processentitymanage') + '/index.html'
        });

        
        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
        
    }
);
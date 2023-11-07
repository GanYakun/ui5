sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/rolemanage/test/integration/FirstJourney',
		'com/banfftech/rolemanage/test/integration/pages/RolesList',
		'com/banfftech/rolemanage/test/integration/pages/RolesObjectPage'
    ],
    function(JourneyRunner, opaJourney, RolesList, RolesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/rolemanage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheRolesList: RolesList,
					onTheRolesObjectPage: RolesObjectPage
                }
            },
            opaJourney.run
        );
    }
);
sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/banfftech/approvalmanage/test/integration/FirstJourney',
		'com/banfftech/approvalmanage/test/integration/pages/ApprovalsList',
		'com/banfftech/approvalmanage/test/integration/pages/ApprovalsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ApprovalsList, ApprovalsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/banfftech/approvalmanage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheApprovalsList: ApprovalsList,
					onTheApprovalsObjectPage: ApprovalsObjectPage
                }
            },
            opaJourney.run
        );
    }
);
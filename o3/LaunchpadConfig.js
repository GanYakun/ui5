// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/**
 * @fileOverview This file contains a sample Fiori sandbox application configuration.
 */

(function () {
  "use strict";
  /*global sap,jQuery, window */

  jQuery.sap.declare("o3.LaunchpadConfig");
  var sUshellTestRootPath = jQuery.sap.getResourcePath("sap/ushell").replace("resources", "test-resources");
  var sUshellO3RootPath = '/o3';
  o3.testContent = {
    //Define groups for the dashboard


    groups: [

    ],
    catalogs: [
      {
        id: "catalog_3",
        title: "Employee Self Service",
        tiles: [
          {
            chipId: "catalogTile_30",
            title: "Leave Request",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            keywords: ["leave request", "request", "personal"],
            properties: {
              title: "Request Leave",
              subtitle: "",
              infoState: "Neutral",
              info: "",
              icon: "sap-icon://create-leave-request",
              targetURL: "#Action-toappnavsample"
            }
          },
          {
            chipId: "catalogTile_44",
            title: "XSS Example",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            properties: {
              title: "<script>alert('Hi');</script>XSS",
              subtitle: "Opens Fiori 1 App<script>alert('Hi');</script>",
              infoState: "Neutral",
              info: "",
              icon: "sap-icon://<script>alert('Hi');</script>",
              targetURL: "#UI2Fiori2SampleApps-MyLeaveRequest"
            }
          }
        ]
      }
    ],
    applications: {

   },

    // data for the personalization service
    personalizationStorageType: "MEMORY",
    pathToLocalizedContentResources: sUshellTestRootPath + "/test/services/resources/resources.properties",
    personalizationData: {
      "sap.ushell.personalization#sap.ushell.services.UserRecents": {
        "ITEM#RecentActivity": {
          recentDay: "2016/5/21",
          recentUsageArray: [
            {
              desktop: undefined,
              tablet: undefined,
              mobile: undefined,
              aUsageArray: [1, 1, 0],
              "iCount": 2,
              "iTimestamp": 1378478828152,
              "oItem": {
                "icon": "sap-icon://search",
                "title": "Search application - just to test long text wrapping",
                "appType": "Search",
                "appId": "#Action-todefaultapp",
                url: "#Action-search&/searchterm=Sample%20App",
                "timestamp": 1378478828152
              }
            },
            {
              desktop: undefined,
              tablet: undefined,
              mobile: undefined,
              aUsageArray: [0, 0, 1],
              "iCount": 1,
              "iTimestamp": 1378478828146,
              "oItem": {
                "title": "title on desktop 2",
                "appType": "Application",
                "appId": "#Action-toappnavsample",
                url: "#Action-toappnavsample?a=122",
                "timestamp": 1378478828152
              }
            },
          ]
        },
        "ITEM#RecentApps": [
          {
            "iCount": 1,
            "iTimestamp": 1378479383874,
            "oItem": {
              "semanticObject": "UI2Fiori2SampleApps",
              "action": "approvepurchaseorders",
              "sTargetHash": "#UI2Fiori2SampleApps-approvepurchaseorders",
              "title": "Approve Purchase",
              "url": "#UI2Fiori2SampleApps-approvepurchaseorders"
            }
          }
        ],
        "ITEM#RecentSearches": [
          { "iCount": 1, "iTimestamp": 1378478828152, "oItem": { "sTerm": "Test" } },
          { "iCount": 1, "iTimestamp": 1378478828151, "oItem": { "sTerm": "Recent search 3" } },
          {
            "iCount": 1,
            "iTimestamp": 1378478828149,
            "oItem": {
              "sTerm": "Recent search 4",
              "oObjectName": { "label": "Business Partners", "value": "Business Partners" }
            }
          },
          {
            "iCount": 1,
            "iTimestamp": 1378478828153,
            "oItem": { "sTerm": "Sally", "oObjectName": { "label": "Employees", "value": "Employees" } }
          },
          { "iCount": 1, "iTimestamp": 1378478828148, "oItem": { "sTerm": "Recent search 5" } },
          { "iCount": 1, "iTimestamp": 1378478828147, "oItem": { "sTerm": "Recent search 6" } },
          { "iCount": 1, "iTimestamp": 1378478828137, "oItem": { "sTerm": "Recent search 16" } },
          { "iCount": 1, "iTimestamp": 1378478828136, "oItem": { "sTerm": "Recent search 17" } },
          { "iCount": 1, "iTimestamp": 1378478828133, "oItem": { "sTerm": "Recent search 20" } },
          { "iCount": 1, "iTimestamp": 1378478828132, "oItem": { "sTerm": "Recent search 21" } },
          { "iCount": 1, "iTimestamp": 1378478828131, "oItem": { "sTerm": "Recent search 22" } },
          { "iCount": 1, "iTimestamp": 1378478828146, "oItem": { "sTerm": "Recent search 7" } },
          { "iCount": 1, "iTimestamp": 1378478828145, "oItem": { "sTerm": "Recent search 8" } },
          { "iCount": 1, "iTimestamp": 1378478828144, "oItem": { "sTerm": "Recent search 9" } },
          { "iCount": 1, "iTimestamp": 1378478828143, "oItem": { "sTerm": "Recent search 10" } },
          { "iCount": 1, "iTimestamp": 1378478828135, "oItem": { "sTerm": "Recent search 18" } },
          { "iCount": 1, "iTimestamp": 1378478828134, "oItem": { "sTerm": "Recent search 19" } },
          { "iCount": 1, "iTimestamp": 1378478828142, "oItem": { "sTerm": "Recent search 11" } },
          { "iCount": 1, "iTimestamp": 1378478828141, "oItem": { "sTerm": "Recent search 12" } },
          { "iCount": 1, "iTimestamp": 1378478828140, "oItem": { "sTerm": "Recent search 13" } },
          { "iCount": 1, "iTimestamp": 1378478828139, "oItem": { "sTerm": "Recent search 14" } },
          { "iCount": 1, "iTimestamp": 1378478828138, "oItem": { "sTerm": "Recent search 15" } }
        ]
      }
    },
    search: {
      searchResultPath: "./searchResults/record.json"
    }
  };

  function writeToUshellConfig(oConfig) {
    jQuery.sap.getObject("sap-ushell-config.services.LaunchPage.adapter.config", 0).groups = oConfig.groups;
    jQuery.sap.getObject("sap-ushell-config.services.LaunchPage.adapter.config", 0).catalogs = oConfig.catalogs;
    jQuery.sap.getObject("sap-ushell-config.services.VisualizationDataProvider.adapter.config", 0).groups = oConfig.groups;
    jQuery.sap.getObject("sap-ushell-config.services.VisualizationDataProvider.adapter.config", 0).catalogs = oConfig.catalogs;
    jQuery.sap.getObject("sap-ushell-config.services.NavTargetResolution.adapter.config", 0).applications = oConfig.applications;
    jQuery.sap.getObject("sap-ushell-config.services.Personalization.adapter.config", 0).personalizationData = oConfig.personalizationData;
    jQuery.sap.getObject("sap-ushell-config.services.Personalization.adapter.config", 0).storageType = oConfig.personalizationStorageType;
    jQuery.sap.getObject("sap-ushell-config.services.Search.adapter.config", 0).searchResultPath = oConfig.search && oConfig.search.searchResultPath;
  }

  writeToUshellConfig(o3.testContent);
  delete jQuery.sap.getObject("sap-ushell-config.services.NavTargetResolution.adapter.config", 0).applications[""];
  // TODO: temp work-around, "" should be removed from apps

}());

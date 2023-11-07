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
      {
        id: "我的主页",
        title: "我的主页",
        isPreset: true,
        isVisible: true,
        isGroupLocked: false,
        tiles: [

        ]
      },
      {
        id: "c",
        title: "采购管理",
        isPreset: true,
        isVisible: true,
        isGroupLocked: false,
        tiles: [
          {
            id: "purchaseorder_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "PurchaseOrder",
            "semanticAction": "Manage",
            properties: {
              title: "采购单",
              subtitle: "采购单主数据",
              info: "采购单的通用管理",
              targetURL: "#PurchaseOrder-manage",
            }
          },
          {
            id: "supplierParty_manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Supplier",
            "semanticAction": "Manage",
            properties: {
              title: "供应商",
              subtitle: "供应商主数据",
              info: "供应商的通用管理",
              targetURL: "#SupplierParty-Manage",
            }
          },
          {
            id: "purchaseRequest_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Purchase",
            "semanticAction": "Request",
            properties: {
              title: "采购请求",
              subtitle: "采购请求管理",
              info: "采购请求应用",
              targetURL: "#Purchase-Request",
            }
          },
          {
            id: "purchaseQuote_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "PurchaseQuote",
            "semanticAction": "Manage",
            properties: {
              title: "报价",
              subtitle: "报价管理",
              info: "报价应用",
              targetURL: "#PurchaseQuote-Manage",
            }
          },
          {
            id: "Invoice",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Invoice",
            "semanticAction": "Manage",
            properties: {
              title: "发票",
              subtitle: "发票主数据",
              info: "发票的通用管理",
              targetURL: "#Invoice-Manage",
            }
          },
          {
            id: "payment_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Payment",
            "semanticAction": "Manage",
            properties: {
              title: "支付",
              subtitle: "支付主数据",
              info: "支付的通用管理",
              targetURL: "#Payment-Manage",
            }
          },
          {
            id: "purchaseAgreement_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "PurchaseAgreement",
            "semanticAction": "Manage",
            properties: {
              title: "合同",
              subtitle: "合同主数据",
              info: "合同的通用管理",
              targetURL: "#PurchaseAgreement-Manage",
            }
          },
          ]
      }
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
      "Invoice-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.invoicemanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/invoice-manage/webapp",
        description: "管理形式发票"
      },
      "PurchaseOrder-manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.purchaseordermanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/purchaseorder-manage/webapp",
        description: "管理采购订单"
      },
      "SupplierParty-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.supplierpartymanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/supplierparty-manage/webapp",
        description: "管理供应商"
      },
      "Purchase-Request": {
        additionalInformation: "SAPUI5.Component=com.banfftech.purchaserequest",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/purchase-request/webapp",
        description: "管理订单"
      },
      "PurchaseQuote-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.purchasequotemanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/purchasequote-manage/webapp",
        description: "管理订单"
      },
      "Payment-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.paymentmanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/payment-manage/webapp",
        description: "管理支付"
      },
      "PurchaseAgreement-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.purchaseagreementmanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/purchaseagreement-manage/webapp",
        description: "预览食品销售数据"
      },
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

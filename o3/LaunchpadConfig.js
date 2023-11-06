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
           id: "主数据-管理",
           title: "主数据-管理",
           isPreset: true,
           isVisible: true,
           isGroupLocked: true,
           tiles: [
            {
                id: "File_View",//tile的ID
                chipId: "catalogTile_35",
                size: "1x1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                isLinkPersonalizationSupported: true,
                "semanticObject": "File",
                "semanticAction": "View",
                properties: {
                   title: "文件归档-下载",
                   subtitle: "文件下载",
                   info: "文件搜索",
                   targetURL: "#File-View",
                }
            },
            {
                id: "Project_Query",//tile的ID
                chipId: "catalogTile_35",
                size: "1x1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                isLinkPersonalizationSupported: true,
                "semanticObject": "Project",
                "semanticAction": "Query",
                properties: {
                   title: "估算书文档-查询",
                   subtitle: "估算书主数据",
                   info: "估算书文档查询",
                   targetURL: "#Project-Query",
                }
            },
            {
                id: "DX_Query",//tile的ID
                chipId: "catalogTile_35",
                size: "1x1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                isLinkPersonalizationSupported: true,
                "semanticObject": "DX",
                "semanticAction": "Query",
                properties: {
                   title: "大修分配-管理",
                   subtitle: "大修分配主数据",
                   info: "大修分配管理",
                   targetURL: "#DX-Query",
                }
            },
            {
                id: "JX_Query",//tile的ID
                chipId: "catalogTile_35",
                size: "1x1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                isLinkPersonalizationSupported: true,
                "semanticObject": "JX",
                "semanticAction": "Query",
                properties: {
                   title: "检修分配-管理",
                   subtitle: "检修分配主数据",
                   info: "检修分配管理",
                   targetURL: "#JX-Query",
                }
            },
            {
                id: "SkbgContentDimension_Query",//tile的ID
                chipId: "catalogTile_35",
                size: "1x1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                isLinkPersonalizationSupported: true,
                "semanticObject": "SkbgContentDimension",
                "semanticAction": "Query",
                properties: {
                   title: "可研文档-查询",
                   subtitle: "科研文档主数据",
                   info: "科研文档查询",
                   targetURL: "#SkbgContentDimension-Query",
                }
            },
           ]
        },
        {
           id: "统计分析-管理",
           title: "统计分析-管理",
           isPreset: true,
           isVisible: true,
           isGroupLocked: true,
           tiles: [
            {
                id: "ProjectAllocFactView_Analysis",//tile的ID
                chipId: "catalogTile_35",
                size: "1x1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                isLinkPersonalizationSupported: true,
                "semanticObject": "ProjectAllocFactView",
                "semanticAction": "Analysis",
                properties: {
                   title: "统计分析-分配事实",
                   subtitle: "分析项目分配情况",
                   info: "按地市单位",
                   targetURL: "#ProjectAllocFactView-Analysis",
                }
            },
            {
              id: "ProjectAllocFactView_BaseDimension1_Analysis",//tile的ID
              chipId: "catalogTile_35",
              size: "1x1",
              tileType: "sap.ushell.ui.tile.StaticTile",
              isLinkPersonalizationSupported: true,
              "semanticObject": "ProjectAllocFact1",
              "semanticAction": "Analysis",
              properties: {
                 title: "统计分析-分配事实",
                 subtitle: "分析项目分配情况",
                 info: "按年度分析",
                 targetURL: "#ProjectAllocFact1-Analysis",
              }
          },
          {
            id: "ProjectAllocFactView_BaseDimension2_Analysis",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "ProjectAllocFact2",
            "semanticAction": "Analysis",
            properties: {
               title: "统计分析-分配事实",
               subtitle: "分析项目分配情况",
               info: "按专业分析",
               targetURL: "#ProjectAllocFact2-Analysis",
            }
        },
        {
          id: "ProjectAllocFactView_BaseDimension3_Analysis",//tile的ID
          chipId: "catalogTile_35",
          size: "1x1",
          tileType: "sap.ushell.ui.tile.StaticTile",
          isLinkPersonalizationSupported: true,
          "semanticObject": "ProjectAllocFact3",
          "semanticAction": "Analysis",
          properties: {
             title: "统计分析-分配事实",
             subtitle: "分析项目分配情况",
             info: "按批次分析",
             targetURL: "#ProjectAllocFact3-Analysis",
          }
      },
            {
              id: "JxywProjectInvestmentView_Analysis",//tile的ID
              chipId: "catalogTile_35",
              size: "1x1",
              tileType: "sap.ushell.ui.tile.StaticTile",
              isLinkPersonalizationSupported: true,
              "semanticObject": "JxywProjectInvestment",
              "semanticAction": "Analysis",
              properties: {
                 title: "统计分析-投资暂估",
                 subtitle: "分析检修项目投资情况",
                 info: "按地市分析",
                 targetURL: "#JxywProjectInvestment-Analysis",
              }
          },
          {
            id: "JxywProjectInvestmentView_BaseDimension1_Analysis",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "JxywProjectInvestment1",
            "semanticAction": "Analysis",
            properties: {
               title: "统计分析-投资暂估",
               subtitle: "分析检修项目投资情况",
               info: "按年度分析",
               targetURL: "#JxywProjectInvestment1-Analysis",
            }
        },
        {
          id: "JxywProjectInvestmentView_BaseDimension2_Analysis",//tile的ID
          chipId: "catalogTile_35",
          size: "1x1",
          tileType: "sap.ushell.ui.tile.StaticTile",
          isLinkPersonalizationSupported: true,
          "semanticObject": "JxywProjectInvestment2",
          "semanticAction": "Analysis",
          properties: {
              title: "统计分析-投资暂估",
              subtitle: "分析检修项目投资情况",
              info: "按批次分析",
             targetURL: "#JxywProjectInvestment2-Analysis",
          }
      },
      {
        id: "JxywProjectInvestmentView_BaseDimension3_Analysis",//tile的ID
        chipId: "catalogTile_35",
        size: "1x1",
        tileType: "sap.ushell.ui.tile.StaticTile",
        isLinkPersonalizationSupported: true,
        "semanticObject": "JxywProjectInvestment2",
        "semanticAction": "Analysis",
        properties: {
            title: "统计分析-投资暂估",
            subtitle: "分析检修项目投资情况",
            info: "按专业分析",
           targetURL: "#JxywProjectInvestment3-Analysis",
        }
    }
           ]
        },
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
     "File-View": {
       additionalInformation: "SAPUI5.Component=com.banfftech.fileview",
       applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
       url: sUshellO3RootPath + "/apps/file-view/webapp",
       description: "管理文件"
     },
     "Project-Query": {
       additionalInformation: "SAPUI5.Component=com.banfftech.projectquery",
       applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
       url: sUshellO3RootPath + "/apps/project-query/webapp",
       description: "项目管理"
     },
     "DX-Query": {
       additionalInformation: "SAPUI5.Component=com.banfftech.dxquery",
       applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
       url: sUshellO3RootPath + "/apps/dx-query/webapp",
       description: "大修管理"
     },
     "JX-Query": {
       additionalInformation: "SAPUI5.Component=com.banfftech.jxquery",
       applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
       url: sUshellO3RootPath + "/apps/jx-query/webapp",
       description: "检修管理"
     },
     "SkbgContentDimension-Query": {
       additionalInformation: "SAPUI5.Component=com.banfftech.skbgwordcontentquery",
       applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
       url: sUshellO3RootPath + "/apps/skbgwordcontent-query/webapp",
       description: "可研文档管理"
     },
     "ProjectAllocFactView-Analysis": {
        additionalInformation: "SAPUI5.Component=com.banfftech.projectallocanalysis",
        applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
        url: sUshellO3RootPath + "/apps/projectalloc-analysis/webapp",
        description: "项目分配统计分析"
     },
     "ProjectAllocFact1-Analysis": {
      additionalInformation: "SAPUI5.Component=com.banfftech.projectallocfactbasedimension1analysis",
      applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
      url: sUshellO3RootPath + "/apps/projectallocfact-basedimension1-analysis/webapp",
      description: "项目分配统计分析"
   },
   "ProjectAllocFact2-Analysis": {
    additionalInformation: "SAPUI5.Component=com.banfftech.projectallocfactbasedimension2analysis",
    applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
    url: sUshellO3RootPath + "/apps/projectallocfact-basedimension2-analysis/webapp",
    description: "项目分配统计分析"
 },
 "ProjectAllocFact3-Analysis": {
  additionalInformation: "SAPUI5.Component=com.banfftech.projectallocfactbasedimension3analysis",
  applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
  url: sUshellO3RootPath + "/apps/projectallocfact-basedimension3-analysis/webapp",
  description: "项目分配统计分析"
},
     "JxywProjectInvestment-Analysis": {
      additionalInformation: "SAPUI5.Component=com.banfftech.jxywprojectinvestmentanalysis",
      applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
      url: sUshellO3RootPath + "/apps/jxywprojectinvestment-analysis/webapp",
      description: "项目分配统计分析"
   },
   "JxywProjectInvestment1-Analysis": {
    additionalInformation: "SAPUI5.Component=com.banfftech.jxywprojectinvestmentbasedimension1analysis",
    applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
    url: sUshellO3RootPath + "/apps/jxywprojectinvestment-basedimension1-analysis/webapp",
    description: "项目分配统计分析"
 },
 "JxywProjectInvestment2-Analysis": {
  additionalInformation: "SAPUI5.Component=com.banfftech.jxywprojectinvestmentbasedimension2analysis",
  applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
  url: sUshellO3RootPath + "/apps/jxywprojectinvestment-basedimension2-analysis/webapp",
  description: "项目分配统计分析"
},
"JxywProjectInvestment3-Analysis": {
  additionalInformation: "SAPUI5.Component=com.banfftech.jxywprojectinvestmentbasedimension3analysis",
  applicationType: "URL",//URL 当前窗口,NWBC4出新窗口
  url: sUshellO3RootPath + "/apps/jxywprojectinvestment-basedimension3-analysis/webapp",
  description: "项目分配统计分析"
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

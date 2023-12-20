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

  let cookies = document.cookie.split(';')
    // console.log({cookies})
    let currentToken =null
    for (let i = 0; i < cookies.length; i++) {
            const [name, value] = cookies[i].split('=');
            if (name.trim() === 'userLoginId') {
              currentToken = value
            }
          }
      console.log({currentToken})
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
      {//审批
          id: "ApprovalAppManage",
          title: "审批管理",
          isPreset: true,
          isVisible: true,
          isGroupLocked: true,
          tiles: [
          {
          id: "Approval_Manage",//tile的ID
          chipId: "catalogTile_35",
          size: "1x1",
          tileType: "sap.ushell.ui.tile.StaticTile",
          isLinkPersonalizationSupported: true,
          "semanticObject": "Approval",
          "semanticAction": "Manage",
              properties: {
                title: "审批管理",
                subtitle: "审批管理",
                info: "审批主数据管理",
                targetURL: "#Approval-Manage",
              }
         }
        ],
       },{
        //业务对象管理(标签显示配置、业务对象配置)
        id: "SystemManage",
        title: "系统管理",
        isPreset: true,
        isVisible: true,
        isGroupLocked: true,
        tiles: [
          {
            id: "approve_flow",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "ProcessEntity",
            "semanticAction": "Manage",
            properties: {
              title: "业务对象-管理",
              subtitle: "业务对象管理",
              info: "程序员管理可审批的业务对象、字段的语义化",
              targetURL: "#ProcessEntity-Manage",
            }
          },{
            id: "customer_process_entity_manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "ProcessEntity",
            "semanticAction": "Manage",
            properties: {
              title: "业务应用-管理",
              subtitle: "业务应用管理",
              info: "设置业务应用对应的字段是否可用作审批条件",
              targetURL: "#Customer-ProcessEntity-Manage",
            }
          },{
            id: "UILabApp_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "UILabApp",
            "semanticAction": "Manage",
            properties: {
              title: "应用访问权限",
              subtitle: "应用权限主数据",
              info: "应用访问权限",
              targetURL: "#UIApp-Manage",
            }
          }
        ],
      },
       {//主数据
         id: "orgStructure_manage",
         title: "组织管理",
         isPreset: true,
         isVisible: true,
         isGroupLocked: true,
         tiles: [
          {
            id: "Role_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Role",
            "semanticAction": "Manage",
            properties: {
              title: "角色管理",
              subtitle: "角色管理",
              info: "角色主数据",
              targetURL: "#Role-Manage",
            }
         },
        ],
      },
      {
        id: "c",
        title: "采购管理",
        isPreset: true,
        isVisible: true,
        isGroupLocked: false,
        tiles: [
         
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
              // targetURL: "#SupplierParty-Manage&/SupplierParties(${PartyUserLogin.partyId})",
              // targetURL: `#SupplierParty-Manage&/SupplierParties('${currentToken}')`,
              targetURL: "#SupplierParty-Manage"
            }
          },
          {
            id: "supplierApprove_ManageByApplication",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "SupplierApprove",
            "semanticAction": "ManageByApplication",
            properties: {
              title: "供应商管理-申请人使用",
              subtitle: "供应商数据填写",
              info: "供应商数据填写",
              targetURL: "#SupplierApprove-ManageByApplication",
            }
          },
          {
            id: "supplierApprove_ManageBySuppLier",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "SupplierApprove",
            "semanticAction": "ManageBySuppLier",
            properties: {
              title: "供应商管理-供应商使用",
              subtitle: "供应商数据填写",
              info: "供应商数据填写",
              targetURL: "#SupplierApprove-ManageBySupplier",
            }
          },
          {
            id: "supplierApprove_ManageByCompliance",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "SupplierApprove",
            "semanticAction": "ManageByCompliance",
            properties: {
              title: "供应商管理-合规部门使用",
              subtitle: "供应商数据填写",
              info: "供应商数据填写",
              targetURL: "#SupplierApprove-ManageByCompliance",
            }
          },
          {
            id: "supplierApprove_ManageByProcurement",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "SupplierApprove",
            "semanticAction": "ManageByProcurement",
            properties: {
              title: "供应商管理-采购部门使用",
              subtitle: "供应商数据填写",
              info: "供应商数据填写",
              targetURL: "#SupplierApprove-ManageByProcurement",
            }
          },
          {
            id: "supplier_dd_form",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "SupplierDDForm",
            "semanticAction": "Input",
            properties: {
              title: "供应商_DD_Form",
              subtitle: "填写DDForm",
              info: "填写DDForm",
              targetURL: "#Supplier-DDForm",
            }
          },
          {
            id: "catalogRequest_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Catalog",
            "semanticAction": "Request",
            properties: {
              title: "Catalog-Request",
              subtitle: "Catalog-Request",
              info: "Catalog-Request",
              targetURL: "#Catalog-Request",
            }
          },
          {
            id: "purchaseRequest_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "Purchase",
            "semanticAction": "Manage",
            properties: {
              title: "Requirement",
              subtitle: "Requirement Manage",
              info: "Requirement Manage",
              targetURL: "#Requirement-Manage",
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
              title: "Purchase-Request",
              subtitle: "Purchase-Request",
              info: "Purchase-Request",
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
              title: "PurchaseQuote",
              subtitle: "PurchaseQuote Manage",
              info: "PurchaseQuote Manage",
              targetURL: "#PurchaseQuote-Manage",
            }
          },
          {
            id: "purchaseorder_Manage",//tile的ID
            chipId: "catalogTile_35",
            size: "1x1",
            tileType: "sap.ushell.ui.tile.StaticTile",
            isLinkPersonalizationSupported: true,
            "semanticObject": "PurchaseOrder",
            "semanticAction": "Manage",
            properties: {
              title: "PurchaseOrder",
              subtitle: "PurchaseOrder Manage",
              info: "PurchaseOrder Manage",
              targetURL: "#PurchaseOrder-manage",
            }
          },
          // {
          //   id: "Invoice",//tile的ID
          //   chipId: "catalogTile_35",
          //   size: "1x1",
          //   tileType: "sap.ushell.ui.tile.StaticTile",
          //   isLinkPersonalizationSupported: true,
          //   "semanticObject": "Invoice",
          //   "semanticAction": "Manage",
          //   properties: {
          //     title: "发票",
          //     subtitle: "发票主数据",
          //     info: "发票的通用管理",
          //     targetURL: "#Invoice-Manage",
          //   }
          // },
          // {
          //   id: "payment_Manage",//tile的ID
          //   chipId: "catalogTile_35",
          //   size: "1x1",
          //   tileType: "sap.ushell.ui.tile.StaticTile",
          //   isLinkPersonalizationSupported: true,
          //   "semanticObject": "Payment",
          //   "semanticAction": "Manage",
          //   properties: {
          //     title: "支付",
          //     subtitle: "支付主数据",
          //     info: "支付的通用管理",
          //     targetURL: "#Payment-Manage",
          //   }
          // },
          // {
          //   id: "purchaseAgreement_Manage",//tile的ID
          //   chipId: "catalogTile_35",
          //   size: "1x1",
          //   tileType: "sap.ushell.ui.tile.StaticTile",
          //   isLinkPersonalizationSupported: true,
          //   "semanticObject": "PurchaseAgreement",
          //   "semanticAction": "Manage",
          //   properties: {
          //     title: "合同",
          //     subtitle: "合同主数据",
          //     info: "合同的通用管理",
          //     targetURL: "#PurchaseAgreement-Manage",
          //   }
          // },
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
      "SupplierApprove-ManageByApplication": {
        additionalInformation: "SAPUI5.Component=com.banfftech.supplierapprovemanagebyapplication",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/supplierapprove-managebyapplication/webapp",
        description: "管理供应商"
      },
      "SupplierApprove-ManageByCompliance": {
        additionalInformation: "SAPUI5.Component=com.banfftech.supplierapprovemanagebycompliance",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/supplierapprove-managebycompliance/webapp",
        description: "管理供应商"
      },
      "SupplierApprove-ManageBySupplier": {
        additionalInformation: "SAPUI5.Component=com.banfftech.supplierapprovemanagebysupplier",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/supplierapprove-managebysupplier/webapp",
        description: "管理供应商"
      },
      "SupplierApprove-ManageByProcurement": {
        additionalInformation: "SAPUI5.Component=com.banfftech.supplierapprovemanagebyprocurement",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/supplierapprove-managebyprocurement/webapp",
        description: "管理供应商"
      },
      "Supplier-DDForm": {
        additionalInformation: "SAPUI5.Component=com.banfftech.vendorddform",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/vendor-dd-form/webapp",
        description: "填写DDForm"
      },
      "Purchase-Request": {
        additionalInformation: "SAPUI5.Component=com.banfftech.purchaserequest",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/purchase-request/webapp",
        description: "管理订单"
      },
      "Catalog-Request": {
        additionalInformation: "SAPUI5.Component=com.banfftech.catalogrequest",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/catalog-request/webapp",
        description: "管理订单"
      },
      "PurchaseQuote-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.purchasequotemanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/purchasequote-manage/webapp",
        description: "管理订单"
      },
      "Requirement-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.requirementmanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/requirement-manage/webapp",
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
      "Approval-Manage": {
       additionalInformation: "SAPUI5.Component=com.banfftech.approvalmanage",
       applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
       url: sUshellO3RootPath + "/apps/approval-manage/webapp",
       description: "审批管理"
      },
      "Role-Manage": {
       additionalInformation: "SAPUI5.Component=com.banfftech.rolemanage",
       applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
       url: sUshellO3RootPath + "/apps/role-manage/webapp",
       description: "角色管理"
      },
      "ProcessEntity-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.processentitymanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/process-entity-manage/webapp",
        description: "业务主表管理"
      },
      "Customer-ProcessEntity-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.customerprocessentitymanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/customer-process-entity-manage/webapp",
        description: "业务主表调整"
      },
      "UIApp-Manage": {
        additionalInformation: "SAPUI5.Component=com.banfftech.uilabappmanage",
        applicationType: "URL",//URL 当前窗口,NWBC 跳出新窗口
        url: sUshellO3RootPath + "/apps/uilab-app-manage/webapp",
        description: "应用访问权限"
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

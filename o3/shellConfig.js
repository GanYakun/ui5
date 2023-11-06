var oClientSideTargetResolutionAdapterConfig = {
  services: {
    NavTargetResolution: {
      config: {
        // enable to inject the NavTarget for #Test-url etc. directly via url parameters
        // .../FioriLaunchpad.html?sap-ushell-test-url-url=%2Fushell%2Ftest-resources%2Fsap%2Fushell%2Fdemoapps%2FAppNavSample&sap-ushell-test-url-additionalInformation=SAPUI5.Component%3Dsap.ushell.demo.AppNavSample#Test-url
        allowTestUrlComponentConfig: true
      }
    },
    SupportTicket: {
      // service has to be enabled explicitly for the demo platform
      config: {
        enabled: true
      }
    },
    EndUserFeedback: {
      config: {
        enabled: true
      }
    },
    UsageAnalytics: {
      config: {
        enabled: false,
        setUsageAnalyticsPermitted: true,
        logClickEvents: false,
        logPageLoadEvents: false,
        pubToken: "f5d00f4d-e968-1649-8285-66ee86ba7845",
        baseUrl: "https://poc.warp.sap.com/tracker/"
      }
    },
    Notifications: {
      config: {
        enabled: false,
        serviceUrl: "/sap/opu/odata4/iwngw/notification/default/iwngw/notification_srv/0001",
        pollingIntervalInSeconds: 30
      }
    },
    AllMyApps: {
      config: {
        enabled: true,
        showHomePageApps: true,
        showCatalogApps: true,
        showExternalProviders: true
      }
    },
    UserInfo: {
      adapter: {
        config: {
          themes: [
            {id: "sap_fiori_3", name: "SAP Quartz Light"},
            {id: "sap_fiori_3_dark", name: "SAP Quartz Dark"},
            {id: "sap_belize_plus", name: "SAP Belize Plus"},
            {id: "sap_belize", name: "SAP Belize"},
            {id: "theme1_id", name: "Custom Theme"},
            {id: "sap_fiori_3_hcb", name: "SAP Quartz HCB"},
            {id: "sap_fiori_3_hcw", name: "SAP Quartz HCW"}
          ]
        }
      }
    },
    // NavigationDataProvider: {
    //   adapter: {
    //     module: "sap.ushell.adapters.local.ClientSideTargetResolutionAdapter",
    //     config: oClientSideTargetResolutionAdapterConfig
    //   }
    // },
    // VisualizationDataProvider: {
    //   adapter: {
    //     module: "sap.ushell.adapters.local.LaunchPageAdapter"
    //   }
    // },
    // ClientSideTargetResolution: {
    //   adapter: {
    //     config: oClientSideTargetResolutionAdapterConfig
    //   }
    // },
    // PagePersistence: {
    //   adapter: {
    //     module: "sap.ushell.adapters.local.PagePersistenceAdapter"
    //   }
    // },
    Container: {
      adapter: {
        config: {
          setUserCallback: 'o3LoadUser',
          systemProperties: {
            productName: "Demo Product Name",
            systemName: "Demo System Name",
            systemRole: "Demo System Role",
            tenantRole: "Demo Tenant Role"
          }
        }
      }
    }
  },
  renderers: {
    fiori2: {
      componentData: {
        config: {
          enableNotificationsUI: true,
          enableSetTheme: true,
          enableSetLanguage: true,
          enableHelp: true,
          preloadLibrariesForRootIntent: false,
          enableRecentActivity: false,
          enableRecentActivityLogging: false,
          enableContentDensity: true,
          enableUserDefaultParameters: true,
          enableBackGroundShapes: true,
          disableAppFinder: false,
          enableUserImgConsent: false,
          sizeBehavior: "Responsive",
          // sessionTimeoutIntervalInMinutes : 30,
          // sessionTimeoutReminderInMinutes : 5,
          // enableAutomaticSignout : false,
          applications: {
            "Shell-home": {
              optimizeTileLoadingThreshold: 200,
              enableEasyAccess: true,
              enableEasyAccessSAPMenu: true,
              enableEasyAccessSAPMenuSearch: true,
              enableEasyAccessUserMenu: true,
              enableEasyAccessUserMenuSearch: true,
              enableCatalogSearch: true,
              enableCatalogTagFilter: true,
              disableSortedLockedGroups: false,
              enableTileActionsIcon: false,
              appFinderDisplayMode: "appBoxes", //"tiles"
              enableHideGroups: true,
              homePageGroupDisplay: "scroll",
              enableHomePageSettings: true
            }
          },
          rootIntent: "Shell-home",
          esearch: {
            searchBusinessObjects: true
          }
        }
      }
    }
  },
  bootstrapPlugins: {},
  ushell: {
    productSwitch: {
      url: "productInstances.json"
    },
    darkMode: {
      enabled: false
    }
  }
};

window["sap-ushell-config"] = oClientSideTargetResolutionAdapterConfig;

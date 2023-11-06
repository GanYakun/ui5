sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageBox',
    "o3/library/model/formatter",
    "o3/library/model/factory"
], function (Controller, MessageBox, formatter, factory) {
    "use strict";
    return Controller.extend("o3.home.controller.BaseController", {
        formatter: formatter,
        factory: factory,
        metadata: {
            manifest: "json"
        },
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        i18n: function (param, arr) {
            let oBundle = this.getModel("i18n").getResourceBundle();
            return oBundle.getText(param, arr);
        },
        showLoading: function (iDelay) {
            if (!iDelay) {
                iDelay = 0;
            }
            sap.ui.core.BusyIndicator.show(iDelay);
        },
        hideLoading: function () {
            sap.ui.core.BusyIndicator.hide();
        },
        post: function (url, params) {
            $.ajax({
                type: 'POST',
                url: url,
                data: params.data && JSON.stringify(params.data),
                contentType: 'application/json',
                success: function (rsp) {
                    params.success && params.success(rsp);
                },
                error: function (rsp) {
                    MessageBox.error(rsp.responseJSON.error.message,
                        {
                            actions: [sap.m.MessageBox.Action.OK],
                            styleClass: "sapUiSizeCompact",
                            onClose: function (sAction) {
                                params.error && params.error(rsp.responseJSON);
                            }
                        }
                    );
                },
                complete: function (rsp) {
                    params.complete && params.complete(rsp.responseJSON);
                }
            });
        },
        fillParameter: function (oObjectBinding, jsonModel) {
            if (!oObjectBinding || !jsonModel) {
                return;
            }
            if ($.isEmptyObject(jsonModel.getData())) {
                return;
            }
            for (var itemKey in jsonModel.getData()) {
                oObjectBinding.setParameter(itemKey, jsonModel.getProperty('/' + itemKey));
            }
        }
    });

});
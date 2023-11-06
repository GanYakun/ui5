/*
 * @Author: your name
 * @Date: 2020-02-25 11:52:04
 * @LastEditTime: 2020-05-15 12:53:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /sapui5-sdk-1.75.0/test-resources/sap/m/demokit/sample/TablePerso/PersoService.js
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var PersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : []
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
            oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : []
			};
			this._oBundle = oInitialData;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return PersoService;

}, /* bExport= */ true);

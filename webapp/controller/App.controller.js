sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("myprojects.ODataV4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit: function () {
			var oJSONData = {
				busy: false
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");
		},

		onRefresh: function (oEvent) {
			var oBinding = this.byId("peopleList").getBinding("items");
			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},

		/**
		 *  Private Functions
		 */
		_getText: function (sTextId, aArgs) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return oResourceBundle.getText(sTextId, aArgs);
		}
	});
});
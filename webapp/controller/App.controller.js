sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Sorter) {
	"use strict";

	return Controller.extend("myprojects.ODataV4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit: function () {
			var oJSONData = {
				busy: false,
				order: 0
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

		onSearch: function (oEvent) {
			var aFilter = [],
				sQuery = oEvent.getParameter("query"),
				oTable = this.byId("peopleList"),
				oBinding = oTable.getBinding("items");

			if (sQuery) {
				aFilter.push(new Filter("LastName", FilterOperator.Contains, sQuery));
			}

			oBinding.filter(aFilter);
		},

		onSort: function (oEvent) {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
				sMessage,
				iOrder = oView.getModel("appView").getProperty("/order");

			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("peopleList").getBinding("items").sort(sOrder && new Sorter("LastName", sOrder === "desc"));

			sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
			MessageToast.show(sMessage);
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
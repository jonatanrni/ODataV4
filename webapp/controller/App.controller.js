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
				order: 0,
				hasUIChanges: false,
				usernameEmpty: true
			};

			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				oMessageModelBinding = oMessageModel.bindList(
					"/",
					undefined, [],
					new Filter("technical", FilterOperator.EQ, true)
				);
			this.getView().setModel(oMessageModel, "message");
			oMessageModelBinding.attachChange(this._onMessageBindingChange, this);

			this._bTechnicalErros = false;

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

		onCreate: function (oEvent) {
			var oList = this.byId("peopleList"),
				oBinding = oList.getBinding("items"),
				oContext = oBinding.create({
					"UserName": "",
					"FirstName": "",
					"LastName": "",
					"Age": "18"
				});

			this._setUIChanges();

			this.getView().getModel("appView").setProperty("/usernameEmpty", true);

			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});

		},

		onInputChange: function (oEvent) {
			if (oEvent.getParameter("escPressed")) {
				this._setUIChanges();
			} else {
				this._setUIChanges(true);
				//Check UserName entered
				if (oEvent.getSource().getParent().getBindingContext().getProperty("UserName")) {
					this.getView().getModel("appView").setProperty("/usernameEmpty", false);
				}
			}
		},

		onSave: function (oEvent) {

			var fnSuccess = function () {
				this._setBusy(false);
				MessageToast.show(this._getText("changesSentMessage"));
				this._setUIChanges(false);
			}.bind(this);

			var fnError = function (oError) {
				this._setBusy(false);
				this._setUIChanges(false);
				MessageBox.error(oError.message);
			}.bind(this);

			//Lock UI until submitBatch is resolved 
			this._setBusy(true);
			this.getView().getModel().submitBatch("peopleGroup").then(fnSuccess, fnError);
			this._bTechnicalErros = false;

		},

		onCancel: function (oEvent) {
			var oList = this.byId("peopleList"),
				oBinding = oList.getBinding("items");

			oBinding.resetChanges();
			this._bTechnicalErros = false;
			this._setUIChanges();

		},

		onDelete: function (oEvent) {
			var oSelectedItem = this.byId("peopleList").getSelectedItem();

			if (oSelectedItem) {
				oSelectedItem.getBindingContext().delete("$auto").then(
					function () {
						MessageToast.show(this._getText("deletionSuccessMessage"));
					}.bind(this),
					function (oError) {
						MessageBox.error(oError.message);
					}
				);
			}
		},

		/**
		 *  Private Functions
		 */
		_getText: function (sTextId, aArgs) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return oResourceBundle.getText(sTextId, aArgs);
		},

		_setUIChanges: function (bHasUIChanges) {
			if (this._bTechnicalErros) {
				//// If there is currently a technical error, then force 'true'
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			var appViewModel = this.getView().getModel("appView");
			appViewModel.setProperty("/hasUIChanges", bHasUIChanges);
		},

		_onMessageBindingChange: function (oEvent) {
			var aContexts = oEvent.getSource().getContexts(),
				aMessages,
				bMessageOpen = false;

			if (bMessageOpen || !aContexts.length) {
				return;
			}

			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			this._setUIChanges(true);
			this._bTechnicalErros = true;

			MessageBox.error(aMessages[0].message, {
				id: "serviceErrorMessageBox",
				onClose: function () {
					bMessageOpen = false;
				}
			});

			bMessageOpen = true;

		},

		_setBusy: function (bIsBusy) {
			var oViewModel = this.getView().getModel("appView");
			oViewModel.setProperty("/busy", bIsBusy);
		}
	});
});
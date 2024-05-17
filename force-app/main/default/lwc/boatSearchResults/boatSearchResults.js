import { LightningElement, wire, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { refreshApex } from "@salesforce/apex";

import BOAT_SELECT_MESSAGE_CHANNEL from "@salesforce/messageChannel/BoatSelect__c";

const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";

/**
 * This code does the following:
 * Uses the getBoats Apex method to fetch boats based on the boatTypeId.
 * The searchBoats method updates the boatTypeId and sets isLoading to true.
 * The refresh method refreshes the boats data.
 * The updateSelectedTile method updates the selectedBoatId and sends a message with the selected boat id.
 * The handleSave method saves the changes in the Boat Editor by passing the updated fields from draftValues to the updateBoatList Apex method. It shows a toast message with the title and clears the lightning-datatable draft values.
 * The notifyLoading method checks the current value of isLoading before dispatching the doneloading or loading custom event.
 */

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [];
  boatTypeId = "";
  @track boats;
  isLoading = false;
  error = undefined; // Add this line to track errors

  @wire(MessageContext)
  messageContext;

  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats(result) {
    if (result.data) {
      this.boats = result.data;
      this.isLoading = false;
      this.notifyLoading(this.isLoading);
    } else if (result.error) {
      this.isLoading = false;
      this.notifyLoading(this.isLoading);
      this.error = result.error;
      this.dispatchEvent(
        // Add this block to display error messages
        new ShowToastEvent({
          title: ERROR_TITLE,
          message: this.error,
          variant: ERROR_VARIANT
        })
      );
    }
  }

  @api
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
  }

  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await this.wiredBoats.refresh();
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  updateSelectedTile(boatId) {
    this.selectedBoatId = boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  sendMessageService(boatId) {
    publish(this.messageContext, BOATMC, { recordId: boatId });
  }

  handleSave(event) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    const updatedFields = event.detail.draftValues;
    updateBoatList({ data: updatedFields })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
          })
        );
        this.draftValues = [];
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
        return refreshApex(this.wiredBoatsResult);
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
          })
        );
        this.isLoading = false;
      });
  }

  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent("loading"));
    } else {
      this.dispatchEvent(new CustomEvent("doneloading"));
    }
  }

  renderedCallback() {
    console.log("boat RESULTS.js:", this.boat);
    console.log("selectedBoatId RESULTS.js:", this.selectedBoatId);
  }

  handleBoatSelect(event) {
    this.selectedBoatId = event.detail.boatId;

    // Publish message to BoatMessageChannel
    publish(this.messageContext, BOAT_SELECT_MESSAGE_CHANNEL, {
      recordId: this.selectedBoatId
    });
  }
}

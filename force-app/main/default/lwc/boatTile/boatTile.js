// boatTile.js
import { LightningElement, api, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import BOAT_SELECT_MESSAGE_CHANNEL from "@salesforce/messageChannel/BoatSelect__c";
import BOAT_MESSAGE_CHANNEL from "@salesforce/messageChannel/BoatMessageChannel__c";
import { getRecord } from "lightning/uiRecordApi";

const TILE_WRAPPER_SELECTED_CLASS = "tile-wrapper selected";
const TILE_WRAPPER_UNSELECTED_CLASS = "tile-wrapper";

export default class BoatTile extends LightningElement {
  @api selectedBoatId;
  @api boatId;
  @wire(MessageContext)
  messageContext;

  @wire(getRecord, {
    recordId: "$recordId",
    fields: [
      "Boat__c.Name",
      "Boat__c.Picture__c",
      "Boat__c.Price__c",
      "Boat__c.Length__c",
      "Boat__c.BoatType__c.Name"
      // "Boat__c.Contact__r.Name" // Add this if Contact__r is the owner's name
    ]
  })
  boat;

  connectedCallback() {
    console.log("recordId ---:", this.recordId);
  }

  get backgroundStyle() {
    return this.boat.data && this.boat.data.fields.Picture__c.value
      ? `background-image:url(${this.boat.data.fields.Picture__c.value})`
      : "none";
  }

  get tileClass() {
    console.log("boat object:", this.boat);

    if (this.boat && this.boat.data) {
      console.log("boat data:", this.boat.data);
      console.log("boat fields:", this.boat.data.fields);
      console.log("selectedBoatId:", this.selectedBoatId);

      if (this.boat.data.fields && this.boat.data.fields.Id) {
        const boatId = this.boat.data.fields.Id.value;
        console.log("boatId:", boatId);

        if (boatId === this.selectedBoatId) {
          console.log("Selected boat matches boatId");
          return TILE_WRAPPER_SELECTED_CLASS;
        } else {
          console.log("Selected boat does not match boatId");
        }
      } else {
        console.log("Boat Id field is undefined");
      }
    } else {
      console.log("No boat data available");
    }

    return TILE_WRAPPER_UNSELECTED_CLASS;
  }

  selectBoat() {
    const boatselect = new CustomEvent("boatselect", {
      detail: { boatId: this.boat.data.fields.Id.value }
    });
    this.dispatchEvent(boatselect);

    publish(this.messageContext, BOAT_MESSAGE_CHANNEL, {
      recordId: this.boat.data.fields.Id.value
    });
    publish(this.messageContext, BOAT_SELECT_MESSAGE_CHANNEL, {
      recordId: this.boat.data.fields.Id.value
    });
  }

  get ownername() {
    return this.boat && this.boat.data.fields.Contact__r.value
      ? this.boat.data.fields.Contact__r.value
      : "";
  }
}

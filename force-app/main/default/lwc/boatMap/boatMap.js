import { LightningElement, wire, api, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import {
  subscribe,
  MessageContext,
  APPLICATION_SCOPE
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

const LONGITUDE_FIELD = "Boat__c.Geolocation__Longitude__s";
const LATITUDE_FIELD = "Boat__c.Geolocation__Latitude__s";
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  @api boatId;
  @track mapMarkers = [];
  subscription = null;
  error = undefined;

  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute("boatId", value);
    this.boatId = value;
  }

  @wire(MessageContext) messageContext;
  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      this.updateMap(data);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  subscribeMC() {
    if (this.subscription || this.recordId) {
      return;
    }
  }

  connectedCallback() {
    if (this.subscription || this.boatId) {
      return;
    }
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
  }

  handleMessage(message) {
    this.boatId = message.recordId;
  }

  updateMap(boat) {
    this.mapMarkers = [
      {
        location: {
          Latitude: boat.fields.Geolocation__Latitude__s.value,
          Longitude: boat.fields.Geolocation__Longitude__s.value
        },
        title: boat.fields.Name.value,
        description: `Coords: ${boat.fields.Geolocation__Latitude__s.value}, ${boat.fields.Geolocation__Longitude__s.value}`
      }
    ];
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }
}

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
  // add @track boatId; to not reassign the public property
  @api boatId;
  @api selectedBoatId; // not sure if this is needed

  // Internal id variable to not reassign the public property
  @track _boatId;
  @track mapMarkers = [];
  subscription = null;
  error = undefined;

  @wire(MessageContext) messageContext;

  get boatId() {
    return this._boatId;
  }

  set boatId(value) {
    // Set the boatId attribute in the boatMap component/element
    this.setAttribute("boatId", value);
    this._boatId = value;
  }

  get recordId() {
    return this._boatId;
  }
  set recordId(value) {
    this.setAttribute("boatId", value);
    this._boatId = value;
  }
  /**
   * @wire getRecord
   * @description Wire adapter to fetch boat record data using the _boatId. The wiredRecord method
   *              is automatically invoked with the uiRecordApi module and the recordId property.
   *              It updates the map markers when the boat record data is retrieved successfully,
   *              or handles errors if data fetching fails.
   *
   * @param {Object} wiredData - The wired data containing error and data properties.
   * @param {Error} wiredData.error - The error object returned if there's an issue with data retrieval.
   * @param {Object} wiredData.data - The boat record data retrieved from Salesforce.
   * @fires BoatMessageChannel__c the event that is fired by the method.
   * @listens BOATMC the event that is listened to by the method
   */

  @wire(getRecord, { recordId: "$_boatId", fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      console.log("BoatMap wiredRecord data: ", data);
      this.updateMap(data);
    } else if (error) {
      this.error = error;
      this._boatId = undefined;
      this.mapMarkers = [];
    }
  }

  subscribeMC() {
    // if (this.subscription || this.recordId) return this || undefined;
  }

  /**
   * - retrieve the boat recordId
   * - wire the messageContext in order
   *    to subscribe to the message channel
   *
   * - every time the value of recordId changes,
   *    it uses the getRecord method from uiRecordApi
   *    to retrieve the values from the fields
   *    Geolocation__Longitude__s and Geolocation__Latitude__s
   *
   * - populate the location in the mapMarkers property
   *    using the function named updateMap()
   * @returns
   */
  connectedCallback() {
    // if (this.subscription || this._boatId) {
    //   return;
    // }
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
    console.log("Subscription boatMap.js", this.subscription);
  }

  handleMessage(message) {
    this._boatId = message.recordId;
  }

  /**
   *
   * @param {object} boat the boat data to update the map markers
   */
  updateMap(boat) {
    console.log("Boat data received in updateMap:", boat);

    // Extract the necessary fields from the boat object
    const latitude = boat.fields.Geolocation__Latitude__s.value;
    const longitude = boat.fields.Geolocation__Longitude__s.value;
    // const name = boat.fields.Name.value;
    const name = boat.Name;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Boat Name:", name);
    this.mapMarkers = [
      {
        location: {
          Latitude: boat.fields.Geolocation__Latitude__s.value,
          Longitude: boat.fields.Geolocation__Longitude__s.value
        },
        // TODO - Add the boat name as the title of the marker
        title: name,
        description: `Coords: ${latitude}, ${longitude}`
      }
    ];
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }
}
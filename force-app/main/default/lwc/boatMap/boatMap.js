import { LightningElement, wire, api, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import {
  subscribe,
  unsubscribe,
  MessageContext,
  APPLICATION_SCOPE
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

const LONGITUDE_FIELD = "Boat__c.Geolocation__Longitude__s";
const LATITUDE_FIELD = "Boat__c.Geolocation__Latitude__s";
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

/**
 * We can't find the correct decorator for the recordId
 * getter and setter in the component boatMap JavaScript file.
 * Make sure the component was created according to the requirements,
 * using the proper case-sensitivity.
 *
 *
 */
export default class BoatMap extends LightningElement {
  @api selectedBoatId; // not sure if this is needed

  // Internal id variable to not reassign the public property
  // @track _boatId;
  @track mapMarkers = [];
  subscription = null;
  error = undefined;

  // TODO MY IMPLEMENTATION
  @track boat;

  @api boatId;

  @wire(MessageContext) messageContext;

  // Logic to run recordId changes
  @api
  get recordId() {
    return this.boatId;
  }

  set recordId(value) {
    this.setAttribute("boatId", value);
    this.boatId = value;
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

  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      console.log("BoatMap wiredRecord data: ", data);
      const latitude = data.fields.Geolocation__Latitude__s.value;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      this.updateMap(latitude, longitude, data);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
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
  // connectedCallback() {
  //   // if (this.subscription || this.boatId)
  //   if (!this.subscription)
  //     this.subscription = subscribe(
  //       this.messageContext,
  //       BOATMC,
  //       (message) => this.handleMessage(message),
  //       { scope: APPLICATION_SCOPE }
  //     );
  // }
  connectedCallback() {
    if (this.subscription || this.recordId) return;

    this.subscribeMC();
  }

  subscribeMC() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
          this.boatId = message.recordId;
          this.boat = message.boatData; // if updating boat is a problem update the boatName instead
          console.log(
            "BOAT MAP event data received in handleMessage:",
            message
          );
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }
  /**
   * UnsubscribeMC method
   * - unsubscribes from the message channel
   * - use it in the disconnectedCallback lifecycle hook
   * @returns {void} - returns nothing
   */
  unsubscribeMC() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  /**
   *
   * @param {object} boat the boat data to update the map markers
   */
  updateMap(latitude, longitude, boat) {
    // No boat name in this log statement
    console.log("Boat data received in updateMap:", boat);

    // Extract the necessary fields from the boat object
    // const latitude = boat.fields.Geolocation__Latitude__s.value;
    // const longitude = boat.fields.Geolocation__Longitude__s.value;
    // const name = boat.fields.Name.value;
    const name = this.boat?.Name || "Unknown Boat Name";

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Boat Name:", name);
    this.mapMarkers = [
      {
        location: {
          Latitude: latitude,
          Longitude: longitude
        },
        title: name,
        description: `Coords: ${latitude}, ${longitude}`
      }
    ];
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }
}

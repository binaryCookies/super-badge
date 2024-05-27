// imports
import { LightningElement, wire, api, track } from "lwc";
import getBoatsByLocation from "@salesforce/apex/BoatDataService.getBoatsByLocation";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import {
  subscribe,
  unsubscribe,
  MessageContext,
  APPLICATION_SCOPE
} from "lightning/messageService";

import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

const LABEL_YOU_ARE_HERE = "You are here!";
const ICON_STANDARD_USER = "standard:user";
const ERROR_TITLE = "Error loading Boats Near Me";
const ERROR_VARIANT = "error";

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId = "";

  @track mapMarkers = [];
  @track isLoading = true;
  @track isRendered = false;

  latitude;
  longitude;

  subscription = null;

  @track selectedBoatId;
  @track boat;
  @track boatId;

  @track boats;

  @wire(MessageContext) messageContext;

  /**
   * connectedCallback a lifecycle hook.
   * connectedCallback() is called when the component is inserted into the DOM.
   * Handle the boatdata event to update map markers
   *
   * Does not need to be explicitly called
   */

  connectedCallback() {
    this.subscribeToMessageChannel();
    console.log(
      "BoatsNearMe connectedCallback",

      { boatTypeId: this.boatTypeId }
    );
  }

  /**
   * Subscribe to the message channel
   * Receives selected boatId and boat object from message
   */
  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
          console.log("Received message:", message);

          // Verify that the message.boatData is an array and has at least one element

          this.boats = message.boatData;

          // Ensure each boat object has the expected structure
          const firstBoat = message.boatData[0];
          console.log("First boat:", firstBoat);

          if (firstBoat && firstBoat.BoatType__r && firstBoat.BoatType__r.Id) {
            this.boatTypeId = firstBoat.BoatType__r.Id;
            console.log(
              "BOATS NEAR ME event data received in handleMessage:",
              message
            );
            console.log("Extracted boatTypeId:", this.boatTypeId);
          } else {
            console.error(
              "Boat object does not have expected BoatType__r structure:",
              firstBoat
            );
          }

          // Trigger wire method update
          refreshApex(this.wiredBoatsJSON);
        },
        { scope: APPLICATION_SCOPE }
      );
    }
    return this.subscription;
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  unsubscribeToMessageChannel() {
    if (this.subscription) {
      unsubscribe(this.subscription);
      this.subscription = null;
    }
  }

  // TODO update boatTypeId from the menu
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, {
    latitude: "$latitude",
    longitude: "$longitude",
    // boatTypeId: "a01aj00000HnGCDAA3"
    boatTypeId: "$boatTypeId"
  })
  wiredBoatsJSON({ error, data }) {
    if (data) {
      this.createMapMarkers(data);
    } else if (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.body.message,
          variant: ERROR_VARIANT
        })
      );

      this.isLoading = false;
    }
  }

  /**
   *`RenderedCallback` that gets the location from the browser
   * LWC lifecycle hook that is called after the component is rendered
   * Automatically calls `getLocationFromBrowser()` does not need to be explictly called
   *
   * Why: We want to get the location from the browser only once, when the component is rendered
   *
   * @Boolean isRendered - flag to check if the component has been rendered
   * @method getLocationFromBrowser - async method leveraging GeoNavigator API to get the location from the browser
   * @returns {Promise} - returns a promise that resolves a lng/lat position when the location is fetched
   */
  async renderedCallback() {
    if (!this.isRendered) {
      await this.getLocationFromBrowser();
      this.isRendered = true;
    }
  }

  /**
   * Complete the method named getLocationFromBrowser().
   * This method has to leverage the browser API to get the current position
   * using the function getCurrentPosition(), saving the coordinates into
   * the properties latitude and longitude using the arrow notation: position => {}.
   * To follow performance best practices, add logic to renderedCallback()
   * to get the location from the browser only if the map has not been rendered yet.
   * Use the property isRendered.
   */
  getLocationFromBrowser() {
    // if (this.isRendered) return;

    return new Promise((resolve, reject) => {
      const geolocation = navigator.geolocation;
      if (!geolocation) {
        reject("Geolocation is not supported by this browser.");
      }
      geolocation.getCurrentPosition(
        (position) => {
          if (position) {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            console.log(
              "USER Location from browser:",
              this.latitude,
              this.longitude
            );
            resolve();
          }
        },

        (error) => {
          console.error("Error getting location", error);
          reject(error);
        }
      );
    });
  }

  // Creates the map markers
  createMapMarkers(boatData) {
    const boats = JSON.parse(boatData);
    this.mapMarkers = boats.map((boat) => {
      console.log("Processing boat:", boat);
      const Latitude = boat.Geolocation__Latitude__s;
      const Longitude = boat.Geolocation__Longitude__s;

      return {
        location: { Latitude, Longitude },
        title: boat.Name,
        description: `Coords:${Latitude},${Longitude}`
      };
    });
    this.mapMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER
    });
    this.isLoading = false;
  }
}

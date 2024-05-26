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

/**
 * TODO
 ** We can't find the variables boatTypeId, mapMarkers, isLoading
 ** instantiated correctly in the component
 ** boatsNearMe JavaScript file.
 */
export default class BoatsNearMe extends LightningElement {
  @track boatTypeId = "";
  @track boatTypeId2 = "";
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
          if (
            message.boatData &&
            Array.isArray(message.boatData) &&
            message.boatData.length > 0
          ) {
            this.boats = message.boatData;

            // Ensure each boat object has the expected structure
            const firstBoat = message.boatData[0];
            console.log("First boat:", firstBoat);

            if (
              firstBoat &&
              firstBoat.BoatType__r &&
              firstBoat.BoatType__r.Id
            ) {
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
          } else {
            console.error(
              "Received message is not in the expected format or is empty:",
              message
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
    this.isLoading = false;
    if (error) {
      this.showToast(ERROR_TITLE, error.body.message, ERROR_VARIANT);
      console.error("Error in wiredBoatsJSON:", error);
      return;
    }

    if (data) {
      console.log("fn wiredBoatsJSON: boats near me:", data);
      try {
        const boatData = JSON.parse(data);
        this.createMapMarkers(boatData);
      } catch (err) {
        console.error("Error processing data:", err);
        this.showToast(err);
      }
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
    if (this.isRendered) return;

    try {
      await this.getLocationFromBrowser();
      console.log("Location from browser:", this.latitude, this.longitude);
      this.isRendered = true; // Set isRendered to true after location is fetched and map is rendered
    } catch (error) {
      console.error("Error getting location from browser:", error);
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
    if (this.isRendered) return;

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
    // Log the input boatData
    console.log("Input boatData to createMapMarkers:", boatData);

    // Check if boatData is an array
    if (!Array.isArray(boatData)) {
      console.error("Expected boatData to be an array, but got:", boatData);
      return;
    }

    const newMarkers = boatData.map((boat) => {
      // Log each boat's details
      console.log("Processing boat:", boat);

      return {
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s
        },
        title: boat.Name,
        description: `Coords: ${boat.Geolocation__Latitude__s}, ${boat.Geolocation__Longitude__s}`
      };
    });

    // Log the user’s current location before unshifting
    console.log(
      "User's location - Latitude:",
      this.latitude,
      "Longitude:",
      this.longitude
    );

    // Add the current user's location marker
    newMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER
    });

    // Log the final newMarkers array
    console.log("Final mapMarkers array:", newMarkers);

    // Set the mapMarkers property
    this.mapMarkers = newMarkers;

    this.isRendered = true;
  }

  showToast(error) {
    const event = new ShowToastEvent({
      title: this.ERROR_TITLE,
      message: error.body.message,
      variant: this.ERROR_VARIANT
    });
    this.dispatchEvent(event);
  }
}

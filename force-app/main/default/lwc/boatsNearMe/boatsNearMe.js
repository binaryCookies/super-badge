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

import { refreshApex } from "@salesforce/apex";

const LABEL_YOU_ARE_HERE = "You are here!";
const ICON_STANDARD_USER = "standard:user";
const ERROR_TITLE = "Error loading Boats Near Me";
const ERROR_VARIANT = "error";

export default class BoatsNearMe extends LightningElement {
  @track boatTypeId;
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
   * Subscribe to the message channel
   * Receives selected boatId and boat object from message
   */
  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
          this.boats = message;
          this.boatTypeId = message.boatData.id;
          console.log(
            "BOATS NEAR ME event data received in handleMessage:",
            message
          );
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
    boatTypeId: "a01aj00000HnGCDAA3"
    // boatTypeId: "$boatTypeId"
  })
  wiredBoatsJSON({ error, data }) {
    if (error) {
      console.error("Error in wiredBoatsJSON:", error);
      return;
    }

    // Check result - should be an array of boat objects
    if (data) console.log("fn wiredBoatsJSON: boats near me:", data);

    // Try to parse the JSON string into an array
    try {
      const boatData = JSON.parse(data);
      this.createMapMarkers(boatData);
    } catch (e) {
      console.error("Invalid JSON:", data);
    }
    this.isLoading = false;
  }

  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  //   async renderedCallback() {
  //     if (this.isRendered) return;
  //     this.isRendered = true;
  //     await this.getLocationFromBrowser();
  //   }

  /**
   * Complete the method named getLocationFromBrowser().
   * This method has to leverage the browser API to get the current position
   * using the function getCurrentPosition(), saving the coordinates into
   * the properties latitude and longitude using the arrow notation: position => {}.
   * To follow performance best practices, add logic to renderedCallback()
   * to get the location from the browser only if the map has not been rendered yet.
   * Use the property isRendered.
   */
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
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

  /**
   * Handle the boatdata event to update map markers
   */

  connectedCallback() {
    this.subscribeToMessageChannel();

    this.getLocationFromBrowser()
      .then(() => {
        console.log(
          "Location from browser:",
          this.latitude,
          this.longitude
          // this.boats // undefined
        );
      })
      .catch((error) => {
        console.error("Error getting location from browser:", error);
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
  }
}

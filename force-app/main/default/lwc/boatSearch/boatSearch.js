// import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";
// import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { publish, MessageContext } from "lightning/messageService";

export default class BoatSearch extends NavigationMixin(LightningElement) {
  /**
   * track state by declaring private properties
   * isLoading: Tracks changes to the isLoading attribute.
   */
  @track _isLoading = false;

  @track selectedBoatTypeId = "";
  @track searchOptions = [];

  // Try boatTypeId of the menu item selected (the id of the boat type ex. {Name: 'House Boat', Id: 'a01aj00000HnGCFAA3'} etc.)
  @track boatTypeId = "";

  /**
   * Required as per documentation:
   * handleLoading,
   * handleDoneLoading,
   * createNewBoat,
   * searchBoats,
   * isLoading.
   */
  /**
   * Handles loading event
   * isLoading: Tracks changes to the isLoading attribute.
   * @description: Uses private property _isLoading to track changes to the isLoading attribute.
   *
   */

  handleLoading() {
    // Set a loading attribute to true
    this._isLoading = true;
  }

  /**
   * Handles loading event
   * isLoading: Tracks changes to the isLoading attribute.
   * @description: Uses private property _isLoading to track changes to the isLoading attribute.
   *
   */

  handleDoneLoading() {
    // Reset the loading attribute to false
    this._isLoading = false;
  }

  /**
   * Binds isLoading to the boatSearch template
   * isLoading: Tracks changes to the isLoading attribute.
   * @description: Use isLoading getter accessor to make the private property _isLoading public.   *
   * @returns {boolean} isLoading - Returns the value of the private property _isLoading.
   */
  @api
  get isLoading() {
    return this._isLoading;
  }

  /**
   * searchBoats: Required as per documentation
   *
   * @api searchBoats an `@api` method for the parent component to call.
   * @param {Object} event - The event object containing the boatTypeId to search for.
   * @param {Object} event.detail - The detail property of the event object.
   * @param {string} event.detail.boatTypeId - The boatTypeId to filter the boats.
   *
   * @description
   * This function takes the boatTypeId from the event object and calls the getBoats method from the BoatDataService Apex class
   * to retrieve a list of boats filtered by the boatTypeId. The function then updates the boatSearchResults component
   * and dispatches a custom "search" event with the retrieved list of boats. It handles the loading state by setting the isLoading property
   * to true before making the call and to false after the call completes. The function also logs any errors that occur during the process.
   *
   * @returns {Promise<Array>} A promise that resolves to the list of boats.
   */

  // ORIGIAL CODE ========================================================
  async searchBoats(event) {
    this.handleLoading();
    let boats;
    const boatTypeId = event && event.detail ? event.detail.boatTypeId : "";

    console.log("Event Detail:", event.detail); // returns empty object
    console.log("searchBoats method called with boatTypeId:", boatTypeId); // returns the id of the boat type

    /**
     * @description The boatSearchResultsComponent is a reference to the c-boat-search-results component.
     * To get access to the boatSearchResults component and call the searchBoats method
     */
    const boatSearchResultsComponent = this.template.querySelector(
      "c-boat-search-results"
    );
    if (boatSearchResultsComponent) {
      boatSearchResultsComponent.boatTypeId = boatTypeId || "";
    }

    this.dispatchEvent(new CustomEvent("loading"));

    try {
      boats = await getBoats({ boatTypeId });
      console.log("Boats. fn: searchBoats:", boats); // logs the list of boats

      // if (boatSearchResultsComponent) {
      //   boatSearchResultsComponent.searchBoats(boatTypeId); // error not a function
      // }

      const searchEvent = new CustomEvent("search", {
        detail: { boats }
      });
      this.dispatchEvent(searchEvent);

      return boats;
    } catch (error) {
      console.error(
        `Error fetching boats for boatTypeId ${boatTypeId}:`,
        error.message,
        error.stack
      );
    } finally {
      this.handleDoneLoading();
      this.dispatchEvent(new CustomEvent("doneloading"));
    }
  }

  // Creates a new boat
  createNewBoat() {
    // uses the NavigationMixin extension to open a
    // 'standard form' so the user can create a new boat record.
    console.log("createNewBoat called");
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        objectApiName: "Boat__c",
        actionName: "new"
      }
    });
  }
}

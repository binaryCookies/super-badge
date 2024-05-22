// import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";
// import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";

export default class BoatSearch extends NavigationMixin(LightningElement) {
  /**
   * track state by declaring private properties
   * isLoading: Tracks changes to the isLoading attribute.
   */
  _isLoading = false;

  @track selectedBoatTypeId = "";
  @track searchOptions = [];

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
  @api
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
  @api
  handleDoneLoading() {
    // Reset the loading attribute to false
    this._isLoading = false;
  }

  /**
   * Creates the getter for the isLoading property to make it public.
   * isLoading: Tracks changes to the isLoading attribute.
   * @description: Use isLoading getter accessor to make the private property _isLoading public.   *
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
  @api
  async searchBoats(event) {
    this._isLoading = true;
    let boats;
    const boatTypeId = event && event.detail ? event.detail.boatTypeId : "";

    // Query the boatSearchResults component
    const boatSearchResultsComponent = this.template.querySelector(
      "c-boat-search-results"
    );
    if (boatSearchResultsComponent) {
      boatSearchResultsComponent.boatTypeId = boatTypeId;
    }

    // Dispatch loading event
    this.dispatchEvent(new CustomEvent("loading"));

    try {
      boats = await getBoats({ boatTypeId });
      console.log("Boats. fn: searchBoats:", boats);

      // Update boatSearchResults component with new boats data
      if (boatSearchResultsComponent) {
        boatSearchResultsComponent.searchBoats(boatTypeId);
      }

      // Dispatch search event with boats data
      const searchEvent = new CustomEvent("search", {
        detail: { boats }
      });
      this.dispatchEvent(searchEvent);

      return boats;
    } catch (error) {
      console.error("Error fetching boats:", error);
    } finally {
      this._isLoading = false;
      // Dispatch doneLoading event
      this.dispatchEvent(new CustomEvent("doneloading"));
    }

    return boats;
  }

  /**
   * Debugging
   * Use connectedCallback to call the searchBoats
   * method when the component is initialized.
   * Using the connected callback to call the method in the class
   * and hence view the logs in the console.
   */
  connectedCallback() {
    // Call searchBoats method when component is initialized
    this.searchBoats({ detail: { boatTypeId: "a01aj00000HnGCDAA3" } });
  }
  // Creates a new boat
  // Method to handle the search button click
  handleSearch() {
    this.searchBoats({ detail: { boatTypeId: "a01aj00000HnGCDAA3" } });
  }
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

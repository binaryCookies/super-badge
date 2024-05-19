// import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";
// import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";

export default class BoatSearch extends LightningElement {
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
   * @param {Object} event - The event object containing the boatTypeId to search for.
   * @param {Object} event.detail - The detail property of the event object.
   * @param {string} event.detail.boatTypeId - The boatTypeId to filter the boats.
   *
   * @innerFunction getBoats - Fetches the list of boats filtered by the boatTypeId from the BoatDataService Apex class or returns all if no boatTypeId is provided.
   *
   * @description
   * This function takes the boatTypeId from the event object and calls the getBoats method from the BoatDataService Apex class
   * to retrieve a list of boats filtered by the boatTypeId. The function then dispatches a custom "search" event with the retrieved
   * list of boats. It handles the loading state by setting the _isLoading property to true before making the call and to false after
   * the call completes. The function also logs any errors that occur during the process.
   *
   * - use Apex class BoatDataService.getBoats({ boatTypeId }) to get the list of boats.
   * - Return the list of boats filtered by the boatTypeId.
   * - Dispatch custom events "loading" and "doneLoading" to handle the loading spinner.
   * - _isLoading must be a private property.
   *
   * @returns {Promise<Array>} A promise that resolves to the list of boats.
   */

  @api
  async searchBoats(event) {
    let boats;
    this._isLoading = true;
    const boatTypeId = event && event.detail ? event.detail.boatTypeId : null;
    try {
      boats = await getBoats({ boatTypeId: "a01aj00000HnGCDAA3" });
      const searchEvent = new CustomEvent("search", {
        detail: {
          boats: boats
        }
      });
      this.dispatchEvent(searchEvent);
      return boats;
    } catch (error) {
      console.error("Error fetching boats:", error);
    } finally {
      this._isLoading = false;
    }
    return boats;
  }

  // Creates a new boat
  createNewBoat() {
    // uses the NavigationMixin extension to open a
    // 'standard form' so the user can create a new boat record.
    this[NavigationMixin.Navigate]({
      type: "standard__form",
      attributes: {
        objectApiName: "Boat__c",
        actionName: "new"
      }
    });
  }
}

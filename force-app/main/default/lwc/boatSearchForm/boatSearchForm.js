import { LightningElement, track } from "lwc";
import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";

export default class BoatSearchForm extends LightningElement {
  @track selectedBoatTypeId = "";

  // @track searchOptions = [];
  // @track error = [];

  // Private
  error = undefined;
  searchOptions;

  /**
   * Wire custom apex method to retrieve boat types
   * TODO boatTypes()
   */

  /**
   * Fires event that the search option has changed.
   * passes boatTypeId (value of this.selectedBoatTypeId) in the detail
   * TODO handleSearchOptionChange
   */
  handleSearchOptionChange(event) {
    // Create the const searchEvent
    // searchEvent must be the new custom event search
    searchEvent;
    this.dispatchEvent(searchEvent);
  }
}

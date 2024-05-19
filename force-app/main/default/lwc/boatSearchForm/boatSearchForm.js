import { LightningElement, track, wire } from "lwc";
import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";

/**
 * - boat types can be retrieved through an Apex method called getBoatTypes()
 * - Show these values in a <lightning-combobox> that uses -
 *    the selectedBoatTypeId for the value being displayed, -
 *    and the values in the property searchOptions for the available options
 *
 * - Changing the value of this dropdown menu must dynamically trigger the -
 *     search for the boats and display the results in the boatSearchResults component
 *
 *  @param {string} selectedBoatTypeId - The currently selected boat type Id
 */
export default class BoatSearchForm extends LightningElement {
  @track selectedBoatTypeId = "";

  // @track searchOptions = [];
  // @track error = [];

  // Private
  error = undefined;

  /**
   * searchOptions
   * @type {string}
   * @description Holds the list of boat types
   */
  searchOptions;

  /**
   * - boat types can be retrieved through an Apex method called getBoatTypes()
   * - Show these values in a <lightning-combobox> that uses -
   *    the selectedBoatTypeId for the value being displayed,
   *    and the values in the property searchOptions for the available options
   *
   * Wire custom apex method to retrieve boat types
   * @function boatTypes - Apex method to be wired - returns <Public Static List> name and Id of boat types
   * @param {error} error
   * @param {data} data
   *
   * TODO boatTypes({error, data})
   */
  @wire(getBoatTypes)
  boatTypes({ error, data }) {
    if (data) {
      this.searchOptions = data.map((type) => {
        return { label: type.Name, value: type.Id };
      });
    } else if (error) {
      this.error = error;
    }
  }
  /**
   * Fires event that the search option has changed.
   * passes boatTypeId (value of this.selectedBoatTypeId) in the detail
   * @param event
   *
   * TODO handleSearchOptionChange
   */
  handleSearchOptionChange(event) {
    // Create the const searchEvent
    // searchEvent must be the new custom event search
    searchEvent;
    this.dispatchEvent(searchEvent);
  }
}

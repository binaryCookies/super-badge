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
   * TODO boatTypes({error, data}) complete function to populate the map of boat types names and Ids
   */
  @wire(getBoatTypes)
  boatTypes({ error, data }) {
    if (data) {
      console.log("data. fn: boatTypes", data);
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
   * We can’t find the correct settings for the method
   * handleSearchOptionChange() in the component boatSearchForm
   * JavaScript file. Make sure the method was created according
   * to the requirements, including the selectedBoatTypeId assigned
   * to boatTypeId in the detail, and the proper content dispatched
   * through the custom event search, using the correct case-sensitivity
   * and quotation.
   *
   * - Changing the value of this dropdown menu must dynamically trigger the search for the boats
   *  - and display the results in the boatSearchResults component.
   *  - fire a custom event named search, using the method handleSearchOptionChange(event)
   *  - Then pass the value of selectedBoatTypeId in the detail using the key boatTypeId through a dispatched event
   *  @param {event} event
   *  @fires searchEvent
   *  @returns {CustomEvent} names and Id of boat types
   *  @description The custom event ensures Queries to the Apex class for the list of boat types
   */

  handleSearchOptionChange(event) {
    this.selectedBoatTypeId = event.detail.value;
    const searchEvent = new CustomEvent("search", {
      detail: { boatTypeId: this.selectedBoatTypeId }
    });
    return this.dispatchEvent(searchEvent);
  }
}

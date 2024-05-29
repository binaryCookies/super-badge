import { LightningElement, api, wire } from "lwc";
import getSimilarBoats from "@salesforce/apex/BoatDataService.getSimilarBoats";
import { NavigationMixin } from "lightning/navigation";

/**
 * Make sure the Boat record page (Boat__c) contains the boatMap and similarBoats
 * components placed in the right region and that the similarBoats component
 * is filtering boats by Type, Length, and Price.
 */
// import getSimilarBoats
/**
 * Represents the SimilarBoats component.
 * This component displays a list of boats that are similar to a given boat.
 */
export default class SimilarBoats extends NavigationMixin(LightningElement) {
  // Private
  relatedBoats;
  boatId;
  error;
  isLoading = false;

  // public
  @api
  similarBy;

  /**
   * Gets the boatId value.
   * @returns {string} The boatId.
   */
  @api
  get recordId() {
    // returns the boatId
    return this.boatId;
  }

  /**
   * Sets the boatId value.
   * @param {string} value - The boatId value to set.
   */
  set recordId(value) {
    // sets the boatId value
    // sets the boatId attribute
    this.setAttribute("boatId", value);
    this.boatId = value;
  }

  /**
   * Wire custom Apex call, using the import named getSimilarBoats.
   * Populates the relatedBoats list.
   * @param {object} param0 - The result of the wire adapter.
   * @param {object} param0.error - The error object, if any.
   * @param {object} param0.data - The data returned from the Apex method.
   */
  @wire(getSimilarBoats, { boatId: "$boatId", similarBy: "$similarBy" })
  similarBoats({ error, data }) {
    this.isLoading = true;
    if (data) {
      this.relatedBoats = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
    }
    this.isLoading = false;
  }

  /**
   * Gets the title for the component.
   * @returns {string} The title.
   */
  get getTitle() {
    return "Similar boats by " + this.similarBy;
  }

  /**
   * Checks if there are no boats in the relatedBoats list.
   * @returns {boolean} True if there are no boats, false otherwise.
   */
  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  /**
   * Navigates to the detail page of a boat.
   * @param {object} event - The event object containing the boat details.
   */
  openBoatDetailPage(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.detail.boat.Id,
        objectApiName: "Boat__c",
        actionName: "view"
      }
    });
  }
}

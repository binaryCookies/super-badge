// imports
import { LightningElement, api, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getSimilarBoats from "@salesforce/apex/BoatDataService.getSimilarBoats";

export default class SimilarBoats extends NavigationMixin(LightningElement) {
  @track relatedBoats = [];
  @api boatId;
  @api similarBy;

  error;

  // Getter and setter to manipulate the boatId
  @api
  get recordId() {
    return this._boatId;
  }

  set recordId(value) {
    this._boatId = value;
    this.setAttribute("boatId", value);
  }

  // Wire the getSimilarBoats method
  @wire(getSimilarBoats, { boatId: "$boatId", similarBy: "$similarBy" })
  similarBoats({ error, data }) {
    if (data) {
      this.relatedBoats = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.relatedBoats = undefined;
    }
  }

  // Getter to return the title of the card
  get getTitle() {
    return "Similar boats by " + this.similarBy;
  }

  // Getter to return true if there are no related boats
  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  // Method to navigate to the boat detail page
  openBoatDetailPage(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.detail.boatId,
        actionName: "view"
      }
    });
  }
}

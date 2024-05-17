// imports
import { LightningElement, api, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getAllReviews from "@salesforce/apex/BoatDataService.getAllReviews";

export default class BoatReviews extends NavigationMixin(LightningElement) {
  @api boatId;
  @track boatReviews;
  @track isLoading = false;

  // Setter to store the recordId into boatId and call getReviews()
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute("boatId", value);
    this.getReviews();
  }

  // Method to call getAllReviews imperatively and store the return value in boatReviews
  getReviews() {
    this.isLoading = true;
    getAllReviews({ boatId: this.boatId })
      .then((data) => {
        this.boatReviews = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.isLoading = false;
        console.error("Error in getting boat reviews", error);
      });
  }

  // Getter to return true if boatReviews is not null, not undefined, and has at least one record
  get reviewsToShow() {
    return (
      this.boatReviews !== null &&
      this.boatReviews !== undefined &&
      this.boatReviews.length > 0
    );
  }

  // Method to navigate to the user's record page
  navigateToRecord(event) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.target.dataset.recordId,
        actionName: "view"
      }
    });
  }

  // Method to refresh the list of reviews
  @api
  refresh() {
    this.getReviews();
  }
}

// imports
import { LightningElement, api, wire, track } from "lwc";
import getAllReviews from "@salesforce/apex/BoatDataService.getAllReviews";
import { NavigationMixin } from "lightning/navigation";
export default class BoatReviews extends NavigationMixin(LightningElement) {
  // Private
  boatId;
  @track error;
  @track boatReviews;
  @track isLoading;

  // Getter and Setter to allow for logic to run on recordId change
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    //sets boatId attribute
    //sets boatId assignment
    //get reviews associated with boatId
    this.boatId = value;
    this.setAttribute("boatId", value);
    this.getReviews();
  }

  @wire(getAllReviews, { boatId: "$boatId" })
  wiredReviews({ error, data }) {
    if (data) {
      this.boatReviews = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.boatReviews = undefined;
    }
    this.isLoading = false;
  }

  // Getter to determine if there are reviews to display
  get reviewsToShow() {
    // check if not null or undefined
    if (this.boatReviews && this.boatReviews.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  // Public method to force a refresh of the reviews invoking getReviews
  @api
  refresh() {
    this.getReviews();
  }

  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  getReviews() {
    if (this.boatId == null || this.boatId === "") return;

    this.isLoading = true;

    getAllReviews({ boatId: this.recordId })
      .then((result) => {
        this.boatReviews = result;
        this.isLoading = false;
      })
      .catch((error) => {
        this.boatReviews = undefined;
        this.error = error;
      });
  }

  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) {
    event.preventDefault();
    event.stopPropagation();
    const recordId = event.target.dataset.recordId;
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: recordId,
        objectApiName: "BoatReview__c",
        actionName: "view"
      }
    });
  }
}

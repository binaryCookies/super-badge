// imports
import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import BOAT_REVIEW_OBJECT from "@salesforce/schema/BoatReview__c";
import NAME_FIELD from "@salesforce/schema/BoatReview__c.Name";
import COMMENT_FIELD from "@salesforce/schema/BoatReview__c.Comment__c";
import BOAT_FIELD from "@salesforce/schema/BoatReview__c.Boat__c";
import RATING_FIELD from "@salesforce/schema/BoatReview__c.Rating__c";

export default class BoatAddReviewForm extends LightningElement {
  // Private
  @api boatId;
  @track rating;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField = NAME_FIELD;
  commentField = COMMENT_FIELD;
  boatField = BOAT_FIELD;
  ratingField = RATING_FIELD;
  labelSubject = "Review Subject";
  labelRating = "Rating";

  // Gets user rating input from stars component
  handleRatingChanged(event) {
    this.rating = event.detail.rating;
  }

  // Custom submission handler to properly set Rating
  // This function must prevent the anchor element from navigating to a URL.
  handleSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }

  // Shows a toast message once form is submitted successfully
  // Dispatches event when a review is created
  handleSuccess() {
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Review Created!",
        variant: "success"
      })
    );
    this.dispatchEvent(new CustomEvent("createreview"));
    this.handleReset();
  }

  // Clears form data upon submission
  handleReset() {
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
  }
}

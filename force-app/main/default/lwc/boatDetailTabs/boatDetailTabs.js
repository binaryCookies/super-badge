// Custom Labels Imports
import { LightningElement, wire, api } from "lwc";

// import labelDetails for Details
import labelDetails from "@salesforce/label/c.Details";
// import labelReviews for Reviews
import labelReviews from "@salesforce/label/c.Reviews";
// import labelAddReview for Add_Review
import labelAddReview from "@salesforce/label/c.Add_Review";
// import labelFullDetails for Full_Details
import labelFullDetails from "@salesforce/label/c.Full_Details";
// import labelPleaseSelectABoat for Please_select_a_boat
import labelPleaseSelectABoat from "@salesforce/label/c.Please_select_a_boat";

// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
import BOAT_ID_FIELD from "@salesforce/schema/Boat__c.Id";
import BOAT_NAME_FIELD from "@salesforce/schema/Boat__c.Name";

import BOAT_DESCRIPTION_FIELD from "@salesforce/schema/Boat__c.Description__c";
import BOAT_TYPE_FIELD from "@salesforce/schema/Boat__c.BoatType__c";
import BOAT_PRICE_FIELD from "@salesforce/schema/Boat__c.Price__c";
import BOAT_LENGTH_FIELD from "@salesforce/schema/Boat__c.Length__c";

const BOAT_FIELDS = [
  BOAT_ID_FIELD,
  BOAT_NAME_FIELD,
  BOAT_DESCRIPTION_FIELD,
  BOAT_TYPE_FIELD,
  BOAT_PRICE_FIELD,
  BOAT_LENGTH_FIELD
];

import { getRecord, getFieldValue } from "lightning/uiRecordApi";

import {
  MessageContext,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { NavigationMixin } from "lightning/navigation";

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  @api boatId; // set by parent component
  @api boat;
  wiredRecord;

  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat
  };

  @wire(MessageContext) messageContext;
  // Sounde, a02aj000001UFR4AAO
  // @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredBoat(response) {
    const { data, error } = response;
    if (data) {
      console.log("boatDetailsTab.jswiredBoat data:", data);
      this.wiredRecord = data;
      this.error = undefined;
    } else if (error) {
      console.log("boatDetailsTab.jswiredBoat error:", error);
      this.error = error;
      this.wiredRecord = undefined;
    }
  }
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {
    console.log("detailsTabIconName called");
    return this.wiredRecord ? "utility:anchor" : null;
  }

  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    const fieldName = getFieldValue(this.wiredRecord, BOAT_NAME_FIELD);
    console.log("boatName called fieldName:", fieldName);
    return fieldName;
  }

  // Private
  subscription = null;

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeMC();
  }

  // Subscribe to the message channel
  subscribeMC() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
          console.log("boatDetailsTab.js Message received:", message);

          this.boatId = message.recordId;
          this.boat = message.boatData;
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  unsubscribeMC() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
  // Navigates to record page
  navigateToRecordViewPage() {
    console.log("navigateToRecordViewPage called");
    this[NavigationMixin.Navigate]({
      type: "standard__objectPage",
      attributes: {
        recordId: this.boatId,
        objectApiName: "Boat__c",
        actionName: "view" // new | edit | view
      }
    });
  }

  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated(event) {
    const tabset = this.template.querySelector("lightning-tabset");
    if (tabset) {
      tabset.activeTabValue = "reviews";
    }
    const boatReviews = this.template.querySelector("c-boat-reviews");
    if (boatReviews) {
      boatReviews.refresh();
      // boatReviews.refreshReviews();
    }
  }
}

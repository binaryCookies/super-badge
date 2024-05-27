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

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

import { getRecord } from "lightning/uiRecordApi";

import {
  MessageContext,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { NavigationMixin } from "lightning/navigation";

export default class BoatDetailTabs extends LightningElement {
  @api boatId; // set by parent component

  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat
  };

  @wire(MessageContext) messageContext;

  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS })
  wiredBoat({ error, data }) {
    if (data) {
      this.wiredRecord = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.wiredRecord = undefined;
    }
  }
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {}

  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {}

  // Private
  subscription = null;

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeMC();
    this.subscription = null;
  }

  // Subscribe to the message channel
  subscribeMC() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
          this.boatId = message.recordId;
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  // Navigates to record page
  navigateToRecordViewPage() {
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
      boatReviews.refreshReviews();
    }
  }
}

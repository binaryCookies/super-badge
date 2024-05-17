import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";
import {
  APPLICATION_SCOPE,
  subscribe,
  MessageContext
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import BOAT_ID_FIELD from "@salesforce/schema/Boat__c.Id";
import BOAT_NAME_FIELD from "@salesforce/schema/Boat__c.Name";

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  @api boatId;
  @wire(MessageContext) messageContext;
  @wire(getRecord, { recordId: "$boatId", fields: BOAT_FIELDS }) wiredRecord;

  connectedCallback() {
    this.subscribeMC();
  }

  subscribeMC() {
    if (this.subscription) {
      return;
    }
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
  }

  handleMessage(message) {
    if (message.recordId !== this.boatId) {
      this.boatId = message.recordId;
    }
  }

  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  get detailsTabIconName() {
    return this.wiredRecord.data ? "utility:anchor" : null;
  }

  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.boatId,
        actionName: "view"
      }
    });
  }

  // Private
  reviewsTabName = "Reviews__tab";

  // Method to handle the custom event from the child component
  handleReviewCreated() {
    this.template.querySelector("lightning-tabset").activeTabValue =
      this.reviewsTabName;
    this.template.querySelector("c-boat-reviews").refresh();
  }

  // Lifecycle hook to fetch the data after the component is rendered
  renderedCallback() {
    this.template.addEventListener(
      "createreview",
      this.handleReviewCreated.bind(this)
    );
  }
}

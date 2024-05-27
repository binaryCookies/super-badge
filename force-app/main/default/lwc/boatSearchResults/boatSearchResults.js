import { LightningElement, track, wire, api } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { refreshApex } from "@salesforce/apex";

const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";
/**
 * Populate the Search Results and Search Filter
 * - boatSearchResults is the container component for
 *      all the boats in the Gallery, Boats Near Me, and Boat Editor sections
 * - Component Refreshes itself and other components after a record operation happens 
 *      Displays important messages in toast notifications
 * 
 *  - boatSearchResults component initiates a function named 
 *      searchBoats(event) in the boatSearch component
 *      Customize this function to pass the value of boatTypeId to the public function
 * 
 * - Custom event 'loading' and 'doneloading' are dispatched - 
 *      use isLoading private property to dispatch these events as needed

 */

export default class BoatSearchResults extends LightningElement {
  // Store result of getBoats() in boats component attribute
  @track boats;
  @track boat; // boat object for the boatTile.selectBoat Event
  @track error;

  @track _isLoading = false;

  boatTypeId = "";
  @track selectedBoatId;

  // Refresh Apex with boatId
  wiredBoatResults;

  @track columns = [
    { editable: true, label: "Name", fieldName: "Name", type: "text" },
    { editable: true, label: "Length", fieldName: "Length__c", type: "number" },
    { editable: true, label: "Price", fieldName: "Price__c", type: "currency" },
    {
      editable: true,
      label: "Description",
      fieldName: "Description__c",
      type: "text"
    }
  ];
  /**
   * Private properties to track the draft values in the datatable
   */
  draftValues = [];

  // Wire the message context
  @wire(MessageContext)
  messageContext;
  // Subscribe to the message channel
  subscription = null;

  connectedCallback() {
    // this.subscribeToMessageChannel();
    // Listen for the boatselect event
    console.log("BoatSearchResults connectedCallback lifecycle hook");
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // Passes boatTypeId to the getBoats() method
  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats({ error, data }) {
    if (data) {
      this.boats = data;
      // console.log("boatSearchResults. Boats data, wiredBoats: ", data);
      this.error = undefined;

      // publish the boatData object to the BoatMC message channel
    } else if (error) {
      this.error = error;
      this.boats = undefined;
    }
    this._isLoading = false;
  }

  /**
   *  Publishes the selected boat Id on the BoatMC
   * @param {object} event object containing the boat object
   * Use the boat Id from the event.detail to publish the BoatMC
   *
   * Message to be used in the Apex method getBoatByLocation(boatTypeId)
   *
   * REQUIRED: explicitly pass boatId to the parameter recordId
   */
  sendMessageService(boatId) {
    // assign boat.Id to boatId and then add it to a custom event named boatselect
    // const boatId = event.detail.boatId;
    publish(this.messageContext, BOATMC, { recordId: boatId });
  }

  /**
   * TODO
   * Update Apex method getBoatByLocation(boatTypeId)
   * Use the updated boatTypeId to call the getBoats method from the BoatDataService Apex class
   */
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api async refresh() {
    if (this.notifyLoading(true)) this.handleLoading();
    try {
      // await refreshApex(this.wiredBoatResults);
      await refreshApex(this.boats);
    } catch (error) {
      console.error("Error in refresh, boatSearchResults.js:", error);
    }
    if (this.notifyLoading(false)) this.doneLoading();
  }

  /**
   * updateSelectedTile() function
   *
   * The info about the currently selected boat must be sent to other components,
   * like the Current Boat Location and Details. In the boatSearchResults
   * component, use the function updateSelectedTile()
   * to update the information about the currently selected
   * boat Id based on the event.
   *
   * Don’t forget that this component must also use the existing
   * loading spinner when loading records.
   *
   * this function must update selectedBoatId and call sendMessageService
   * TODO
   */
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.notifyLoading(true);

    const updatedFields = event.detail.draftValues;

    updateBoatList({ data: updatedFields })
      .then((data) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,

            message: MESSAGE_SHIP_IT,

            variant: SUCCESS_VARIANT
          })
        );

        this.draftValues = [];

        return this.refresh();
      })
      .catch((error) => {
        this.error = error;

        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,

            message: error.body.message,

            variant: ERROR_VARIANT
          })
        );

        this.notifyLoading(false);
      })

      .finally(() => {
        this.draftValues = [];
      });
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    this._isLoading = isLoading;
    if (this._isLoading) {
      this.dispatchEvent(new CustomEvent("loading"));
    }
    this.dispatchEvent(new CustomEvent("doneloading"));
  }

  disconectedCallback() {
    this.unsubscribeToMessageChannel();
  }
}

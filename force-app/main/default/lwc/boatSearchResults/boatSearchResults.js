import { LightningElement, track, wire, api } from "lwc";
import {
  subscribe,
  publish,
  MessageContext,
  APPLICATION_SCOPE
} from "lightning/messageService";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

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
  @track boats = [];
  @track boat; // boat object for the boatTile.selectBoat Event
  @track error;
  @track _isLoading = false;

  // For boatTile component - debug
  @api boatTypeId = "";
  @track selectedBoatId;

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
    this.subscribeToMessageChannel();
    // Listen for the boatselect event
    this.template.addEventListener(
      "boatselect",
      this.handleBoatSelectEvent.bind(this)
    );
  }

  /**
   * Subscribe to the message channel to retrieve the data published to
   * the channel
   * @returns {object} subscription object `recordId` and `boat` object
   */
  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => this.handleMessage(message),
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  /**
   * TODO event.detail is empty
   * @param {string} event the event name to handle the boat select event
   */
  handleBoatSelectEvent(event) {
    console.log("Event received in boatSearchResults:", event.detail);
    this.selectedBoatId = event.detail.boatId;
    // Additional logic to handle the selected boat
    const message = this.subscribeToMessageChannel();
    console.log(
      "Boat ID and Boat Data from boatselect event:",
      this.boat,
      this.selectedBoatId
    );
  }

  /**
   * Handler for when a message is received from selectBoat()
   * @param {object} message published message from BOATMC message channel containing the boatId and boat object from Boat__c
   * @returns
   */
  handleMessage(message) {
    console.log(
      "Message received From Boat Tile boatTile.selectBoat:",
      message
    );
    this.selectedBoatId = message.recordId;
    // Additional logic to handle the message

    const boatData = message.boatData;
    const recordId = message.recordId;
    const boatName = boatData.Name;
    // TODO boat name to be displayed in the map marker/tile
    console.log(
      "Boat data received in handleMessage:",
      boatName,
      boatData,
      recordId
    );

    // Update the selected boat Id
    this.boat = boatData;
    this.recordId = recordId;
  }

  // connectedCallback() {
  //   if (!this.subscription) {
  //     this.subscription = subscribe(this.messageContext, BOATMC, (message) =>
  //       this.handleMessage(message)
  //     );
  //   }
  // }

  // Passes boatTypeId to the getBoats() method
  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats({ error, data }) {
    if (data) {
      this.boats = data;
      console.log("Boats data, wiredBoats: ", data);
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.boats = undefined;
    }
    this._isLoading = false;
  }

  // Handle the message and update selectedBoatId
  // handleMessage(message) {
  //   this.selectedBoatId = message.recordId;
  //   console.log("Selected boat ID from message service:", this.selectedBoatId);
  // }

  // Handle the boatselect event
  handleBoatSelect(event) {
    this.selectedBoatId = event.detail.boatId;
    console.log("Selected boat ID from custom event:", this.selectedBoatId, {
      detail: event.detail
    });
  }

  /**
   *  Publishes the selected boat Id on the BoatMC
   * @param {object} event object containing the boat object
   * Use the boat Id from the event.detail to publish the BoatMC
   *
   * REQUIRED: explicitly pass boatId to the parameter recordId
   */
  sendMessageService(event) {
    // assign boat.Id to boatId and then add it to a custom event named boatselect
    const boatId = event.detail.boatId;

    publish(this.messageContext, BOATMC, { recordId: boatId });
  }

  /**
   * TODO
   */
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  refresh() {}

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile() {}

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  async handleSave(event) {
    try {
      // notify loading
      this.notifyLoading(true);
      const updatedFields = event.detail.draftValues;
      console.log("Draft values: ", updatedFields);
      const processedFieldValues = updatedFields.map((record) => {
        let fields = {};
        fields.Id = record.Id;
        fields.Name = record.Name;
        fields.Length__c = record.Length__c;
        fields.Price__c = record.Price__c;
        fields.Description__c = record.Description__c;
        return fields;
      });
      // Update the records via Apex
      await updateBoatList({ data: processedFieldValues })
        .then(() => {
          this.notifyLoading(false);

          // Show success messsage
          this.dispatchEvent(
            new ShowToastEvent({
              title: SUCCESS_TITLE,
              message: MESSAGE_SHIP_IT,
              variant: SUCCESS_VARIANT
            })
          );
        })
        .catch((error) => {
          this.notifyLoading(false);

          // Show error message
          this.dispatchEvent(
            new ShowToastEvent({
              title: ERROR_TITLE,
              message: error.body.message,
              variant: ERROR_VARIANT
            })
          );
        })
        .finally(() => {
          // Clear draft values after saving
          const datatable = this.template.querySelector("lightning-datatable");
          if (datatable) datatable.draftValues = [];
        });
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    this._isLoading = isLoading;
    if (this._isLoading) {
      this.dispatchEvent(new CustomEvent("loading"));
    }
    this.dispatchEvent(new CustomEvent("doneloading"));
  }
}
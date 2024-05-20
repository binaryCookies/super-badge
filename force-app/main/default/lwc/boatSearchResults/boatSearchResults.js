import { LightningElement, track, wire, api } from "lwc";
import { subscribe, publish, MessageContext } from "lightning/messageService";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

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
  @track error;
  @track _isLoading = false;

  // For boatTile component - debug
  @api boatTypeId = "";
  @track selectedBoatId;
  subscription = null;

  @track columns = [
    { label: "Name", fieldName: "Name", type: "text" },
    { label: "Length", fieldName: "Length__c", type: "number" },
    { label: "Price", fieldName: "Price__c", type: "currency" },
    { label: "Type", fieldName: "BoatType__r.Name", type: "text" }
  ];

  @wire(MessageContext)
  messageContext;

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

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(this.messageContext, BOATMC, (message) =>
        this.handleMessage(message)
      );
    }
  }

  handleMessage(message) {
    this.selectedBoatId = message.recordId;
  }

  /**
   *  Publishes the selected boat Id on the BoatMC
   * @param {object} event object containing the boat object
   * Use the boat Id from the event.detail to publish the BoatMC
   *
   */
  sendMessageService(event) {
    // assign boat.Id to boatId and then add it to a custom event named boatselect
    const boatId = event.detail.boatId;

    publish(this.messageContext, BOATMC, { recordId: boatId });
  }
}

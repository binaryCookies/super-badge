import { LightningElement, api, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

const TILE_WRAPPER_SELECTED_CLASS = "tile-wrapper selected";
const TILE_WRAPPER_UNSELECTED_CLASS = "tile-wrapper";

// Summary of Data Transfer for BoatTile Component
/**
 * ### Summary of Data Transfer for BoatTile Component

To ensure the data is properly transferred and displayed in the `boatTile` component, the following steps and considerations are essential:

1. **Wire the Message Context:**
   - Import and wire the `MessageContext` to enable communication via the Lightning Message Service.
   ```js
   import { wire, MessageContext } from 'lightning/messageService';
   @wire(MessageContext) messageContext;
   ```

2. **Subscribe to the Message Channel:**
   - Subscribe to the message channel in the `connectedCallback` method to receive updates when a boat is selected.
   ```js
   import { subscribe } from 'lightning/messageService';
   import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

   connectedCallback() {
     this.subscribeToMessageChannel();
   }

   subscribeToMessageChannel() {
     if (!this.subscription) {
       this.subscription = subscribe(
         this.messageContext,
         BOATMC,
         (message) => this.handleMessage(message)
       );
     }
   }

   handleMessage(message) {
     this.selectedBoatId = message.recordId;
   }
   ```

3. **Fetch and Track Boats:**
   - Use the `@wire` decorator to call the `getBoats` Apex method, passing in the `boatTypeId`. Track the data and handle loading and errors.
   ```js
   import getBoats from '@salesforce/apex/BoatDataService.getBoats';
   @wire(getBoats, { boatTypeId: "$boatTypeId" }) wiredBoats({ error, data }) {
     if (data) {
       this.boats = data;
       this.error = undefined;
     } else if (error) {
       this.error = error;
       this.boats = undefined;
     }
     this._isLoading = false;
   }
   ```

4. **Log Data for Debugging:**
   - Add logging to ensure data is received correctly in both `boatSearchResults` and `boatTile`.
   ```js
   // In boatSearchResults
   wiredBoats({ error, data }) {
     if (data) {
       console.log("Boats data: ", data);
     } else if (error) {
       console.error("Error fetching boats: ", error);
     }
   }

   // In boatTile
   renderedCallback() {
     console.log("Boat data in boat-tile: ", this.boat);
   }
   ```

5. **Correctly Pass Data to `boatTile`:**
   - Ensure the `boat` data and `selectedBoatId` are passed as attributes to the `boatTile` component.
   ```html
   <template for:each={boats} for:item="boat">
     <lightning-layout-item key={boat.Id} size="4" class="slds-p-around_small">
       <c-boat-tile
         key={boat.Id}
         boat={boat}
         selected-boat-id={selectedBoatId}
         onboatselect={handleBoatSelect}
       ></c-boat-tile>
     </lightning-layout-item>
   </template>
   ```

By following these steps, we ensure that the `boatTile` component receives the necessary data and can react appropriately to user interactions and data changes. This approach facilitates clear data flow and component communication within the Lightning Web Components framework.
 */

// Requirements for BoatTile Component
/**
 *  boatTile to display a boat for rent with a <div> that reacts to a click event using the function selectBoat().
 *  It must change its own class between tile-wrapper selected and tile-wrapper -
 *  using the function tileClass(), depending on the value of selectedBoatId.
 *  Store these strings in constants called TILE_WRAPPER_SELECTED_CLASS and TILE_WRAPPER_UNSELECTED_CLASS respectively.
 *
 * The search for boat records must be initiated by a function named searchBoats(event)
 * in the boatSearch component.
 * Customize this function to pass the value of boatTypeId to the public function
 * searchBoats(boatTypeId) from the boatSearchResults component,
 * so it can be used by getBoats().
 *
 * This state must adhere to the selected boat across the components.
 * So make sure to add the required logic into selectBoat() to send the correct detail information,-
 * assigning boat.Id to boatId and then adding it to a custom event named boatselect,
 * so the boatSearchResults component can propagate the event using the message service.
 * wire the messageContext in the boatSearchResults component in order to publish the message
 *
 * ** For this reason **, the JavaScript file requires two different attributes to receive information about the boat that displays
 * in the tile (boat) and the currently selected boat Id (selectedBoatId).
 * Make sure to use the correct decorators for these attributes.
 *
 * The boat image must be set as the background of a <div> with a class equals to tile
 * and it must be retrieved via a function named backgroundStyle().
 * The return of this function must be a string that contains the background-image:url() function,
 * showing the boat picture from the field Picture__c on the Boat__c object.
 */

// Challenge Not yet complete... here's what's wrong:
// We can’t find the correct settings for the h1 related to the
// boat name in the component boatTile. Make sure the component
// was created according to the requirements, including styling.

export default class BoatTile extends LightningElement {
  @api selectedBoatId;
  @api boat;

  @wire(MessageContext)
  messageContext;

  handleBoatSelected(message) {
    const boatId = message.boatId;
    console.log("Boat ID received:", boatId);
    // Fetch the boat details using boatId
    this.getBoat(boatId);
  }

  connectedCallback() {
    console.log("boatTile connectedCallback - boat:", this.boat);
    console.log("messageContext:", this.messageContext);
  }

  /**
   *
   * @returns a string that contains the background-image:url(),
   * showing the boat picture from the field Picture__c on the Boat__c object.
   */

  // Getter for dynamically setting the background image for the picture
  get backgroundStyle() {
    return `background-image: url('${this.boat?.Picture__c}')`;
  }

  // Getter for dynamically setting the tile class based on whether the
  // current boat is selected
  get tileClass() {
    return this.boat?.Id === this.selectedBoatId
      ? TILE_WRAPPER_SELECTED_CLASS
      : TILE_WRAPPER_UNSELECTED_CLASS;
  }

  searchBoats(event) {
    const boatTypeId = event.detail.boatTypeId;
    this.template
      .querySelector("c-boat-search-results")
      .searchBoats(boatTypeId);
  }

  loading() {
    const loading = new CustomEvent("loading", {
      detail: {
        isLoading: true
      }
    });
    this.dispatchEvent(loading);
  }
  doneLoading() {
    const loading = new CustomEvent("doneloading", {
      detail: {
        isLoading: false
      }
    });
    this.dispatchEvent(loading);
  }

  // Getter for boat name
  get boatName() {
    return this.boat ? this.boat.Name : "";
  }

  // Getter for boat owner name
  get boatOwnerName() {
    return this.boat && this.boat.Contact__r ? this.boat.Contact__r.Name : "";
  }

  // Getter for boat price
  get boatPrice() {
    return this.boat ? this.boat.Price__c : 0;
  }

  // Getter for boat length
  get boatLength() {
    return this.boat ? this.boat.Length__c : "";
  }

  // Getter for boat type
  get boatType() {
    return this.boat ? this.boat.BoatType__r.Name : "";
  }

  /**
   * A Method to select the boat and publish the id.
   *
   * reacts to click event, selectBoat event handler.
   * - assign boat.Id to boatId
   * - then add the id to a custom event named boatselect
   * - then boatSearchResults component can propagate
   * the event using the message service
   */
  selectBoat() {
    const selectEvent = new CustomEvent("boatselect", {
      detail: { boatId: this.boat?.Id }
    });

    this.dispatchEvent(selectEvent);

    // Publish boat Id using the message service
    publish(this.messageContext, BOATMC, { recordId: this.boat.Id });
  }
}

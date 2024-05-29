import { LightningElement, api, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

const TILE_WRAPPER_SELECTED_CLASS = "tile-wrapper selected";
const TILE_WRAPPER_UNSELECTED_CLASS = "tile-wrapper";

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

/**
 * @class BoatTile
 * @description Represents a boat tile component.
 */
export default class BoatTile extends LightningElement {
  @api selectedBoatId;
  @api boat;

  @wire(MessageContext)
  messageContext;

  /**
   * Getter for dynamically setting the background image for the picture.
   * @returns {string} Background image style.
   */
  get backgroundStyle() {
    return `background-image: url('${this.boat?.Picture__c}')`;
  }

  /**
   * Getter for dynamically setting the tile class based on whether the
   * current boat is selected.
   * @returns {string} Tile class.
   */
  get tileClass() {
    return this.boat?.Id === this.selectedBoatId
      ? TILE_WRAPPER_SELECTED_CLASS
      : TILE_WRAPPER_UNSELECTED_CLASS;
  }

  /**
   * @description This method is used to search for boats.
   * It takes an event object as a parameter, which contains a detail property.
   * This detail property is an object that contains a boatTypeId.
   * The boatTypeId is used to filter the boats.
   * The method then queries the template for the
   * 'c-boat-search-results' component and calls its searchBoats method, passing the boatTypeId.
   *
   * @param {Object} event - The event object.
   * @property {Object} event.detail - The details of the event.
   * @property {string} event.detail.boatTypeId - The boatTypeId to filter the boats.
   */
  searchBoats(event) {
    const boatTypeId = event.detail.boatTypeId;
    this.template
      .querySelector("c-boat-search-results")
      .searchBoats(boatTypeId);
  }

  /**
   * Dispatches a custom event to notify that loading has started.
   */
  loading() {
    const loading = new CustomEvent("loading", {
      detail: {
        isLoading: true
      }
    });
    this.dispatchEvent(loading);
  }

  /**
   * Dispatches a custom event to notify that loading has finished.
   */
  doneLoading() {
    const loading = new CustomEvent("doneloading", {
      detail: {
        isLoading: false
      }
    });
    this.dispatchEvent(loading);
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
  // Add this listener in your connectedCallback method to verify event handling
  selectBoat() {
    if (!this.boat || !this.boat.Id) {
      console.error("Boat or Boat ID is missing", this.boat);
      return;
    }

    // Create the custom event with the boat ID
    const selectEvent = new CustomEvent("boatselect", {
      detail: { boatId: this.boat.Id },
      bubbles: true
      // composed: true // Off, causing error, check if needed
    });

    // Dispatches the event.
    this.dispatchEvent(selectEvent);

    // Publish boat Id and boat info using the message service
    publish(this.messageContext, BOATMC, {
      boatData: this.boat,
      recordId: this.boat.Id
    });
    // Log to check the data being published
    console.log("Published boat data::", this.boat);
    console.log("Published boat ID::", this.boat.Id);
  }
}

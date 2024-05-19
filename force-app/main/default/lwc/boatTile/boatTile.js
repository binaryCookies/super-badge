import { LightningElement } from "lwc";

/**
 *  boatTile to display a boat for rent with a <div> that reacts to a click event using the function selectBoat().
 *  It must change its own class between tile-wrapper selected and tile-wrapper -
 *  using the function tileClass(), depending on the value of selectedBoatId.
 *  Store these strings in constants called TILE_WRAPPER_SELECTED_CLASS and TILE_WRAPPER_UNSELECTED_CLASS respectively.
 *
 * This state must adhere to the selected boat across the components.
 * So make sure to add the required logic into selectBoat() to send the correct detail information,-
 * assigning boat.Id to boatId and then adding it to a custom event named boatselect,
 * so the boatSearchResults component can propagate the event using the message service.
 * wire the messageContext in the boatSearchResults component in order to publish the message
 *
 * For this reason, the JavaScript file requires two different attributes to receive information about the boat that displays
 * in the tile (boat) and the currently selected boat Id (selectedBoatId).
 * Make sure to use the correct decorators for these attributes.
 *
 * The boat image must be set as the background of a <div> with a class equals to tile
 * and it must be retrieved via a function named backgroundStyle().
 * The return of this function must be a string that contains the background-image:url() function,
 * showing the boat picture from the field Picture__c on the Boat__c object.
 */
export default class BoatTile extends LightningElement {}

// import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";
// import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { LightningElement, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class BoatSearch extends LightningElement {
  @track selectedBoatTypeId = "";
  @track searchOptions = [];

  /**
   * Required as per documentation:
   * handleLoading,
   * handleDoneLoading,
   * createNewBoat,
   * searchBoats,
   * isLoading.
   */
  /**
   * isLoading:
   * Tracks changes to the isLoading attribute.
   */
  @track isLoading = false;
  // Handles loading event
  handleLoading() {
    // Set a loading attribute to true
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading() {
    // Reset the loading attribute to false
    this.isLoading = false;
  }

  // Creates a new boat
  createNewBoat() {
    // uses the NavigationMixin extension to open a
    // 'standard form' so the user can create a new boat record.
    this[NavigationMixin.Navigate]({
      type: "standard__form",
      attributes: {
        objectApiName: "Boat__c",
        actionName: "new"
      }
    });
  }

  /**
   * searchBoats:
   * Required as per documentation
   */
  searchBoats() {
    this.isLoading = true;
    this.dispatchEvent(new CustomEvent("loading"));
    this.template
      .querySelector("boatSearchResults")
      .searchBoats(this.selectedBoatTypeId)
      .finally(() => {
        this.isLoading = false;
        this.dispatchEvent(new CustomEvent("doneloading"));
      });
  }

  // fetchBoatTypes() {
  //   getBoatTypes()
  //     .then((result) => {
  //       if (result && result.length > 0) {
  //         console.log("Received boat types:", result);
  //         this.searchOptions = result.map((type) => ({
  //           label: type.Name,
  //           value: type.Id
  //         }));
  //         this.searchOptions.unshift({ label: "All Types", value: "" });
  //       } else {
  //         console.warn("Received empty boat types array");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error loading boat types", error);
  //       this.dispatchEvent(
  //         new ShowToastEvent({
  //           title: "Error",
  //           message: "Failed to load boat types",
  //           variant: "error"
  //         })
  //       );
  //     });
  // }

  // handleSearchOptionChange(event) {
  //   this.selectedBoatTypeId = event.detail.value;
  //   this.searchBoats();
  // }

  // handleRecordOperation(event) {
  //   this.fetchBoatTypes();
  //   this.dispatchEvent(
  //     new ShowToastEvent({
  //       title: "Success",
  //       message: event.detail.message,
  //       variant: "success"
  //     })
  //   );
  // }
}

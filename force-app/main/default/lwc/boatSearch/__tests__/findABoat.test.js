import { createElement } from "lwc";
import BoatSearch from "c/boatSearch";
import { NavigationMixin } from "lightning/navigation";

describe("c-boat-search", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should handle loading", () => {
    // Create an instance of the BoatSearch component
    const element = createElement("c-boat-search", {
      is: BoatSearch
    });

    document.body.appendChild(element);

    // Call the handleLoading method
    element.handleLoading();

    // Check if the loading state has been set correctly
    expect(element.isLoading).toBe(true);
  });

  // it("should create a new boat", () => {
  //   // Create an instance of the BoatSearch component
  //   const element = createElement("c-boat-search", {
  //     is: BoatSearch
  //   });

  //   document.body.appendChild(element);

  // Mock the NavigationMixin.Navigate method
  // element[NavigationMixin.Navigate] = jest.fn();

  // Call the createNewBoat method
  // element.createNewBoat();

  // Check if NavigationMixin.Navigate has been called with the correct parameters
  // expect(element[NavigationMixin.Navigate]).toHaveBeenCalledWith({
  //   type: "standard__objectPage",
  //   attributes: {
  //     objectApiName: "Boat__c",
  //     actionName: "new"
  //   }
  // });
});

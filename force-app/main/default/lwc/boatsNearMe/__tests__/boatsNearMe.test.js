import { createElement } from "lwc";
import BoatsNearMe from "c/boatsNearMe";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";

// Mock the getBoats function
jest.mock(
  "@salesforce/apex/BoatDataService.getBoats",
  () => {
    return {
      default: jest.fn().mockResolvedValue([
        { Name: "Boat Type 1", Id: "1" },
        { Name: "Boat Type 2", Id: "2" }
      ])
    };
  },
  { virtual: true }
);

describe("c-boat-search", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should render c-boat-search component", () => {
    // Arrange
    const element = createElement("c-boat-search", {
      is: BoatsNearMe
    });

    // Act
    document.body.appendChild(element);

    // Assert
    return Promise.resolve().then(() => {
      const div = element.shadowRoot.querySelector("div");
      expect(div).not.toBeNull();
    });
  });
});

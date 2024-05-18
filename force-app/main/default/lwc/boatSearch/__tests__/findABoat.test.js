import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { createElement } from "lwc";
import BoatSearch from "c/boatSearch";

// Mock the getBoats method from the BoatDataService Apex class
jest.mock(
  "@salesforce/apex/BoatDataService.getBoats",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

describe("c-boat-search", () => {
  afterEach(() => {
    // Clean up the DOM after each test
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("should handle loading", () => {
    const element = createElement("c-boat-search", {
      is: BoatSearch
    });

    document.body.appendChild(element);
    element.handleLoading();
    expect(element.isLoading).toBe(true);
  });

  it("should handle doneLoading", () => {
    const element = createElement("c-boat-search", {
      is: BoatSearch
    });

    document.body.appendChild(element);
    element.handleDoneLoading();
    expect(element.isLoading).toBe(false);
  });

  it("searchBoats returns and dispatches boats", async () => {
    const mockBoats = [
      { Id: "a02aj000001UFR4AAO", Name: "Sounder" },
      { Id: "a02aj000001UFR5AAO", Name: "Gallifrey Falls" }
    ];

    // Mock the resolved value of getBoats
    // getBoats.mockResolvedValue(mockBoats);

    // Mock the resolved value of getBoats based on the input parameter
    getBoats.mockImplementation((params) => {
      if (params.boatTypeId === "a01aj00000HnGCDAA3")
        Promise.resolve([mockBoats[0]]); // Return the specific boat for the given boatTypeId
      return Promise.resolve(mockBoats); // Return all boats if no boatTypeId is provided
    });

    // Create the element
    const element = createElement("c-boat-search", {
      is: BoatSearch
    });
    document.body.appendChild(element);

    // Spy on dispatchEvent to verify it gets called later
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");

    // Call the searchBoats method with the mock event
    const mockEvent = { detail: { boatTypeId: "a01aj00000HnGCDAA3" } };
    await element.searchBoats(mockEvent);

    // Verify that getBoats was called with the correct parameter
    expect(getBoats).toHaveBeenCalledWith({ ...mockEvent.detail });
    expect(getBoats).toHaveBeenCalledWith({ boatTypeId: "a01aj00000HnGCDAA3" });

    // Find A Boat: Inspect the element to ensure the correct boat was returned
    // const aBoat = await getBoats({ boatTypeId: "a01aj00000HnGCDAA3" });
    const boatList = await getBoats.mock.results[0].value;
    console.log("Jest - boatList:", boatList);
    expect(boatList).toBe(mockBoats);

    // Verify that dispatchEvent was called with the correct event
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "search",
        detail: { boats: mockBoats }
      })
    );
  });
});

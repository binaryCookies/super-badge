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
/**
 * describe block
 * @description Test suite for c-boat-search component which is used to search for boats.
 * searchBoats method is used to search for boats based on the boatTypeId.
 *
 * The tests are focused on the searchBoats method which is used to search for boats based on the boatTypeId.
 */
describe("c-boat-search", () => {
  afterEach(() => {
    // Clean up the DOM after each test
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  /**
   * Test handling of loading and doneLoading events
   */

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

  /**
   * Test case for no boatTypeId provided.
   */
  it("searchBoats handles no boatTypeId", async () => {
    // Mocked list of boats
    const mockBoats = [
      { Id: "a02aj000001UFR4AAO", Name: "Sounder" },
      { Id: "a02aj000001UFR5AAO", Name: "Gallifrey Falls" }
    ];

    // Mock the resolved value of getBoats
    getBoats.mockResolvedValue(mockBoats);

    // Create the element
    const element = createElement("c-boat-search", {
      is: BoatSearch
    });
    document.body.appendChild(element);

    // Spy on dispatchEvent to verify it gets called later
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");

    // Call the searchBoats method without the boatTypeId
    await element.searchBoats({ detail: {} });

    // Verify that getBoats was called without parameters
    expect(getBoats).toHaveBeenCalledWith({});

    // Verify that dispatchEvent was called with the correct event
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "search",
        detail: { boats: mockBoats }
      })
    );

    // Verify that the returned list has the correct length
    const boatList = await getBoats({});
    expect(boatList.length).toBe(mockBoats.length);
  });

  /**
   * Test case for dispatching search event with boats.
   *  Test searchBoats method with the mock event and mock data.
   * Expect getBoats to be called with the correct parameter and return the correct boat.
   * @test
   * @async
   */
  it("searchBoats returns and dispatches boats", async () => {
    const mockBoats = [
      { Id: "a02aj000001UFR4AAO", Name: "Sounder" },
      { Id: "a02aj000001UFR5AAO", Name: "Gallifrey Falls" }
    ];

    // Mock the resolved value of getBoats based on the input parameter
    getBoats.mockImplementation((params) => {
      if (params.boatTypeId === "a01aj00000HnGCDAA3")
        return Promise.resolve([mockBoats[0]]); // Return the specific boat for the given boatTypeId
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
    expect(getBoats).toHaveBeenCalledWith({ boatTypeId: "a01aj00000HnGCDAA3" });

    // Log the response to verify the correct boat is returned - just because I'm superstitious :)
    const boatList = await getBoats({ boatTypeId: "a01aj00000HnGCDAA3" });
    console.log("Jest - boatList:", boatList);
    expect(boatList).toEqual([mockBoats[0]]);

    // Verify that dispatchEvent was called with the correct event
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "search",
        detail: { boats: [mockBoats[0]] }
      })
    );
  });
});

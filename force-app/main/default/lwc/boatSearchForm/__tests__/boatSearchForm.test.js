import { createElement, wire } from "lwc";
import BoatSearchForm from "c/boatSearchForm";
import { getBoatTypes } from "@salesforce/apex/BoatDataService.getBoatTypes";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";

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

describe("c-boat-search-form", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should render boat types", async () => {
    const element = createElement("c-boat-search-form", {
      is: BoatSearchForm
    });

    document.body.appendChild(element);

    const boatTypeElements = element.shadowRoot.querySelectorAll(".boat-type");
    expect(boatTypeElements.length).toBe(2);
    expect(boatTypeElements[0].textContent).toBe("Boat Type 1");
    expect(boatTypeElements[1].textContent).toBe("Boat Type 2");
  });
});

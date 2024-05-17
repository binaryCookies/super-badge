import { createElement } from "lwc";
import SimilarBoats from "c/similarBoats";

describe("c-similar-boats", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should be empty when initially rendered", () => {
    // Arrange
    const element = createElement("c-similar-boats", {
      is: SimilarBoats
    });

    // Act
    document.body.appendChild(element);

    // Assert
    const boatElements = element.shadowRoot.querySelectorAll("c-boat-tile");
    expect(boatElements.length).toBe(0);
  });
});

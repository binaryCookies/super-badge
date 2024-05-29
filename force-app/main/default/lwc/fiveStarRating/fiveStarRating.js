import { LightningElement, api, track } from "lwc";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import fivestar from "@salesforce/resourceUrl/fivestar";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const ERROR_TITLE = "Error loading five-star";
const ERROR_VARIANT = "error";
const EDITABLE_CLASS = "c-rating";
const READ_ONLY_CLASS = "readonly c-rating";

/**
 * Represents a five-star rating component.
 * @class FiveStarRating
 * @extends LightningElement
 */
export default class FiveStarRating extends LightningElement {
  /**
   * Indicates whether the rating is read-only.
   * @api
   * @type {boolean}
   */
  @api readOnly;

  /**
   * The current value of the rating.
   * @api
   * @type {number}
   */
  @api value;

  /**
   * The edited value of the rating.
   * @type {number}
   * @private
   */
  editedValue;

  /**
   * Indicates whether the rating is rendered.
   * @type {boolean}
   * @private
   */
  isRendered;

  /**
   * Gets the CSS class for the star rating.
   * @type {string}
   * @readonly
   */
  get starClass() {
    return this.readOnly ? READ_ONLY_CLASS : EDITABLE_CLASS;
  }

  /**
   * Callback function called when the component is rendered.
   * @private
   */
  renderedCallback() {
    if (this.isRendered) return;

    // Inform other components that the rating is rendered
    this.dispatchEvent(
      new CustomEvent("ratingrendered", { detail: { rating: this.value } })
    );

    this.isRendered = true;

    Promise.all([
      loadScript(this, fivestar + "/rating.js"),
      loadStyle(this, fivestar + "/rating.css")
    ])
      .then(() => {
        this.initializeRating();
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
          })
        );
      });
  }

  /**
   * Loads the rating script and initializes the rating component.
   * @private
   */
  loadScript() {
    loadScript(this, fivestar + "/rating.js")
      .then(() => {
        loadStyle(this, fivestar + "/rating.css");
      })
      .then(() => {
        this.initializeRating();
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
          })
        );
      });
  }

  initializeRating() {
    let domEl = this.template.querySelector("ul");
    let maxRating = 5;
    let self = this;
    let callback = function (rating) {
      self.editedValue = rating;
      self.ratingChanged(rating);
    };
    this.ratingObj = window.rating(
      domEl,
      this.value,
      maxRating,
      callback,
      this.readOnly
    );
  }

  ratingChanged(rating) {
    this.dispatchEvent(
      new CustomEvent("ratingchange", { detail: { rating: rating } })
    );
  }
}

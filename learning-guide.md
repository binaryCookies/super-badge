## Salesforce LWC and Apex Learning Guide

### Understanding Key Concepts and Best Practices

#### 1. **Lightning Web Components (LWC) Basics**

##### **@api Decorator**

- **How it's used**: The `@api` decorator is used to mark properties and methods as public, allowing parent components to interact with child components.
- **Code Example**:

```javascript
// childComponent.js
import { LightningElement, api } from 'lwc';

export default class ChildComponent extends LightningElement {
  @api message; // Public property
  @api showMessage() { // Public method
    console.log(this.message);
  }
}

// parentComponent.html
<template>
  <c-child-component message="Hello, World!" onclick={handleClick}></c-child-component>
</template>

// parentComponent.js
import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
  handleClick() {
    this.template.querySelector('c-child-component').showMessage();
  }
}
```

##### **@track Decorator**

- **How it's used**: The `@track` decorator tracks changes to the value of a property and triggers rerendering of the component.
- **Code Example**:

```javascript
import { LightningElement, track } from 'lwc';

export default class MyComponent extends LightningElement {
  @track message = 'Hello';

  handleChange(event) {
    this.message = event.target.value;
  }
}

// myComponent.html
<template>
  <input type="text" oninput={handleChange}>
  <p>{message}</p>
</template>
```

##### **@wire Decorator**

- **How it's used**: The `@wire` decorator is used to call an Apex method or Lightning Data Service and wire the results to a property or function.
- **Code Example**:

```javascript
import { LightningElement, wire } from "lwc";
import getContacts from "@salesforce/apex/ContactController.getContacts";

export default class ContactList extends LightningElement {
  @wire(getContacts)
  contacts;
}

// contactList.html
<template>
  <template if:true={contacts.data}>
    <template for:each={contacts.data} for:item="contact">
      <p key={contact.Id}>{contact.Name}</p>
    </template>
  </template>
  <template if:true={contacts.error}>
    <p>{contacts.error}</p>
  </template>
</template>;
```

#### 2. **Component Composition and Communication**

##### **Child Component Communication**

- **How it's used**: A parent component can pass data to a child component using public properties and methods defined with `@api`.
- **Code Example**:

```javascript
// childComponent.js
import { LightningElement, api } from 'lwc';

export default class ChildComponent extends LightningElement {
  @api data;
}

// parentComponent.html
<template>
  <c-child-component data={parentData}></c-child-component>
</template>

// parentComponent.js
import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
  parentData = 'Data from parent';
}
```

##### **Shadow DOM**

- **How it's used**: Shadow DOM is used to encapsulate the component’s styles and markup, ensuring style isolation.
- **Code Example**:

```html
<!-- parentComponent.html -->
<template>
  <style>
    p {
      color: blue;
    }
  </style>
  <p>This is inside parent component.</p>
  <c-child-component></c-child-component>
</template>

<!-- childComponent.html -->
<template>
  <style>
    p {
      color: red;
    }
  </style>
  <p>This is inside child component.</p>
</template>
```

#### 3. **Handling Data with Apex**

##### **Imperative vs. Wire Service**

- **How it's used**: Imperative calls are used for more control over when an Apex method is called, while wire service is used for automatic, reactive data fetching.
- **Code Example**:

**Imperative Apex Call**:

```javascript
import { LightningElement } from "lwc";
import getContacts from "@salesforce/apex/ContactController.getContacts";

export default class ImperativeCallExample extends LightningElement {
  contacts;
  error;

  handleLoad() {
    getContacts()
      .then((result) => {
        this.contacts = result;
      })
      .catch((error) => {
        this.error = error;
      });
  }
}

// imperativeCallExample.html
<template>
  <button onclick={handleLoad}>Load Contacts</button>
  <template if:true={contacts}>
    <template for:each={contacts} for:item="contact">
      <p key={contact.Id}>{contact.Name}</p>
    </template>
  </template>
  <template if:true={error}>
    <p>{error}</p>
  </template>
</template>;
```

**Wire Service**:

```javascript
import { LightningElement, wire } from "lwc";
import getContacts from "@salesforce/apex/ContactController.getContacts";

export default class WireServiceExample extends LightningElement {
  @wire(getContacts)
  contacts;
}

// wireServiceExample.html
<template>
  <template if:true={contacts.data}>
    <template for:each={contacts.data} for:item="contact">
      <p key={contact.Id}>{contact.Name}</p>
    </template>
  </template>
  <template if:true={contacts.error}>
    <p>{contacts.error}</p>
  </template>
</template>;
```

##### **Error Handling in Apex**

- **How it's used**: Errors in Apex can be handled using try-catch blocks and returning meaningful error messages.
- **Code Example**:

```apex
public with sharing class ContactController {
  @AuraEnabled(cacheable=true)
  public static List<Contact> getContacts() {
    try {
      return [SELECT Id, Name FROM Contact];
    } catch (Exception e) {
      throw new AuraHandledException('Error fetching contacts: ' + e.getMessage());
    }
  }
}
```

#### 4. **User Interface and UX Enhancements**

##### **lightning-spinner**

- **How it's used**: The `lightning-spinner` component is used to indicate loading states in the UI.
- **Code Example**:

```html
<template>
  <lightning-spinner
    if:true="{isLoading}"
    alternative-text="Loading"
    size="small"
  ></lightning-spinner>
  <template if:true="{contacts}">
    <template for:each="{contacts}" for:item="contact">
      <p key="{contact.Id}">{contact.Name}</p>
    </template>
  </template>
</template>
```

##### **lightning-layout-item**

- **How it's used**: `lightning-layout-item` is used to create responsive grid layouts.
- **Code Example**:

```html
<template>
  <lightning-layout multiple-rows="true">
    <lightning-layout-item
      padding="around-small"
      size="12"
      small-device-size="6"
      medium-device-size="4"
      large-device-size="4"
    >
      <p>Responsive Item 1</p>
    </lightning-layout-item>
    <lightning-layout-item
      padding="around-small"
      size="12"
      small-device-size="6"
      medium-device-size="4"
      large-device-size="4"
    >
      <p>Responsive Item 2</p>
    </lightning-layout-item>
  </lightning-layout>
</template>
```

#### 5. **Event Handling and Navigation**

##### **Custom Events**

- **How it's used**: Custom events are used to communicate between components using events.
- **Code Example**:

```javascript
// childComponent.js
import { LightningElement, api } from 'lwc';

export default class ChildComponent extends LightningElement {
  @api handleClick() {
    const selectedEvent = new CustomEvent('myevent', { detail: { value: 'test' } });
    this.dispatchEvent(selectedEvent);
  }
}

// parentComponent.html
<template>
  <c-child-component onmyevent={handleMyEvent}></c-child-component>
</template>

// parentComponent.js
import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
  handleMyEvent(event) {
    console.log(event.detail.value);
  }
}
```

##### **NavigationMixin**

- **How it's used**: The `NavigationMixin` is used to navigate to different pages or records in Salesforce.
- **Code Example**:

```javascript
import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class NavigateToRecordExample extends NavigationMixin(
  LightningElement
) {
  navigateToRecord() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: "003B00000067RnxIAE",
        actionName: "view"
      }
    });
  }
}

// navigateToRecordExample.html
<template>
  <lightning-button
    label="View Record"
    onclick={navigateToRecord}
  ></lightning-button>
</template>;
```

#### 6. **Testing and Debugging**

##### **Jest Testing for LWC**

- **How it's used**: Jest is used for writing unit tests for LWC components.
- **Code Example**:

```javascript
import { createElement } from "lwc";
import MyComponent from "c/myComponent";

describe("c-my-component", () => {
  it("renders correctly", () => {
    const element = createElement("c-my-component", {
      is: MyComponent
    });
    document.body.appendChild(element);
    expect(element).toMatchSnapshot();
  });
});
```

##### **Logging Errors**

- **How it's used**: Errors can be logged for

debugging using `console.error` and `JSON.stringify` for complex objects.

- **Code Example**:

```javascript
try {
  // Some code that might throw an error
} catch (error) {
  console.error("An error occurred:", JSON.stringify(error));
}
```

#### 7. **External Libraries and Static Resources**

##### **Using External JavaScript Libraries**

- **How it's used**: Add the library to a static resource and import it in the component.
- **Code Example**:

```javascript
import { LightningElement } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import myLibrary from "@salesforce/resourceUrl/myLibrary";

export default class MyComponent extends LightningElement {
  connectedCallback() {
    loadScript(this, myLibrary)
      .then(() => {
        // Use the library
      })
      .catch((error) => {
        console.error("Error loading script:", error);
      });
  }
}
```

##### **Static Resources**

- **How it's used**: Static resources are used to host JavaScript libraries or other files required by your component.
- **Code Example**:

```javascript
import { LightningElement } from "lwc";
import myResource from "@salesforce/resourceUrl/myResource";

export default class MyComponent extends LightningElement {
  resourceUrl = myResource;
}
```

#### 8. **Rendering and Template Management**

##### **Conditional Rendering**

- **How it's used**: Conditional rendering is used to show or hide parts of the template based on component state.
- **Code Example**:

```html
<template>
  <template if:true="{isVisible}">
    <p>This is conditionally rendered</p>
  </template>
  <template if:false="{isVisible}">
    <p>This is hidden</p>
  </template>
</template>

// myComponent.js import { LightningElement, track } from 'lwc'; export default
class MyComponent extends LightningElement { @track isVisible = true; }
```

##### **Template Iteration**

- **How it's used**: Template iteration is used to iterate over a list of items and render a component for each item.
- **Code Example**:

```html
<template>
  <template for:each="{items}" for:item="item">
    <p key="{item.id}">{item.name}</p>
  </template>
</template>

// myComponent.js import { LightningElement, track } from 'lwc'; export default
class MyComponent extends LightningElement { @track items = [ { id: 1, name:
'Item 1' }, { id: 2, name: 'Item 2' }, { id: 3, name: 'Item 3' } ]; }
```

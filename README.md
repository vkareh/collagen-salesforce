Collagen Salesforce
===================

This module provides a Salesforce back-end storage for models in the
[Collagen.js](http://collagenjs.org) framework.

### Installation & Configuration
Install by running `npm install collagen-salesforce` in your Collagen.js app and
add `require('collagen-salesforce');` in your app's `index.js` file, anywhere
before the model that needs it is loaded. For example:

```js
var collagen = require('collagen');

require('collagen-salesforce'); // This module...

collagen.load(__dirname);
collagen.start();
```

You will need to add the Salesforce configuration details. In your `collagen.json`
file, add the following property, replacing values as appropriate.

```JSON
{
    "salesforce": {
        "username": "username",
        "password": "password",
        "security_token": "secret token"
    }
}
```

### Usage
Once your module is installed and configured, you can query Salesforce by issuing
SOQL queries from within your models' `sync` method.

```js
models.MyModel.prototype.sync = function(method, model, options) {
  model.salesforce.query('SELECT Id, Name FROM Account ... ', function(err, data) {
    if (err) return options.error(new Error(err));
    options.success(data);
  });
});
```


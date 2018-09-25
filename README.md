<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

## Auth0 and AMP Access Sample

This is a AMP demo application based on [AMP Access](https://github.com/ampproject/amphtml/blob/master/extensions/amp-access/amp-access.md) component and using Auth0 for authentication. AMP Access or “AMP paywall and subscription support” provides control to publishers over what content can be accessed by a reader and with what restrictions. This application is integrated with [Auth0](https://auth0.com)

In this sample, all the users that are allowed to login in this demo are considered an subscriber.

You can try the demo [here](https://dailybugle.herokuapp.com).

## Getting Started

This is a quick walk through the source code to get you started with AMP Access. Integrating AMP Access includes two steps:

1. AMP Access Endpoint implementation: integrate publisher paywall via AMP Access callbacks.
2. AMP HTML Configuration: configure the publisher AMP Access endpoints and define content access rules.

#### AMP Access Endpoint implementation

The first step is to implement the AMP Access callbacks in the publisher backend. The endpoint  URLs must be configured in each AMP HTML file using AMP Access:

* **authorization** ([api.js](controllers/amp-access/api.js#L31)): this credentialed CORS endpoint produces the authorization response that can be used in the content markup expressions to show/hide different parts of content (e.g. *for this case we will allow access to all users*). The response is a free-form JSON object: it can contain any properties and values. 
* **pingback** ([api.js](controllers/amp-access/api.js#L89)): the main purposes for pingback is to count down meter when it is used. As a credentialed CORS endpoint it may contain publisher cookies. Thus it can be used to map AMP Reader ID to the reader's identity if they are logged in.
* **login**  ([login.js](controllers/amp-access/login.js#L89)): Integration with Auth0 using Passaport.js. After authenticated in Auth0, a cookie is created with the information needed for AMP Access.
 
Both endpoints, authorization and pingback, must be credentialed CORS endpoints. This is configured in [amp-paywall-cors.js](middlewares/amp-access-cors.js).

#### AMP HTML Configuration

The second step is to integrate AMP Access into the AMP HTML files:

1. Configure the AMP Access endpoints ([article.html](views/amp-access/article.html#21)).

    ```html
    <script id="AMP Access" type="application/json">
      {
        "authorization": "<% host %>/amp-authorization.json?rid=READER_ID&url=CANONICAL_URL&_=RANDOM&ref=DOCUMENT_REFERRER",
        "pingback": "<% host %>/amp-pingback?rid=READER_ID&url=CANONICAL_URL&ref=DOCUMENT_REFERRER",
        "login": "<% host %>/login?rid=READER_ID&url=CANONICAL_URL"
      }
    </script>
    ```

2. Include the AMP Access  component ([article.html](views/amp-access/article.html#L30)):

    ```html
    <script async custom-element="AMP Access" src="https://cdn.ampproject.org/v0/amp-access-0.1.js"></script>
    ```

3. Define which parts of the AMP HTML file are visible to subscribers and non-subscribers ([article.html](views/amp-access/article.html#L51)):

    ```html
    <section AMP Access="access AND subscriber" amp-access-hide>
      Thanks for being a subscriber. You rock!
    </section>
    ```
    
That's it.

#### Auth0 Configuration

The login integration uses Node.js as backend APIs. To integrate Auth0 with Node.js you can follow the documentation [here](https://auth0.com/docs/quickstart/webapp/nodejs/01-login)

## Installation

Clone the repository via:

```none
$ git clone https://github.com/ampproject/amp-publisher-sample.git
```

Install [NodeJS](https://nodejs.org/) and run in the project dir:

```none
$ npm i
$ npm start
```

Configure the file .env to point to your Auth0 instance. ([envtemplate](.envtemplate))

Try the demo at [http://localhost:8002/](http://localhost:8002/). 

## License

The AMP HTML Access Demo is made by Nelson Matias based on the [AMP Project](https://www.ampproject.org/), the sample is based on  [AMP Access](https://github.com/ampproject/amphtml/blob/master/extensions/amp-access/amp-access.md). 

This is a sample code and shouldn't be used for Production Environments
# Weather Map

This project will allow the user to see the current weather at a point they have clicked on the map.

# Browser support

**NOTE** Internet Explorer 11 is not supported due to the use of the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). That and it reached end of life support from Microsoft in June 2022.

# How to launch Application

## Production

The application is hosted on Netlify at https://mellifluous-baklava-7230d6.netlify.app/

## Local development

**\*NOTE:** `yarn` package manager has been used, so there is a `yarn.lock` file. If you use NPM, you will get the latest dependency versions that may not have been tested\*

1. Clone the repository to your machine ([GitHub documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository))
1. Rename the `.env.sample` to `.env` and add your API keys for Mapbox and OpenWeather API
1. Install dependencies
   ```
   yarn install
   ```
1. Run the local development server
   ```
   yarn dev
   ```
   The output of this will provide you the URL with port to the development server.

# Ars Technica RSS Feed Reader

This small React app fetches and displays the [Ars Technica](https://arstechnica.com) RSS feed.

## Online Demo
You can find a working demo of the project [here](https://scrapnet.space/projects/atfeed).

## Installing
To install the project, clone or download the source code and then run `npm install`.

## package.json Scripts
The app was created using Vite, so there are four `package.json` scripts you can run:
* `npm run dev` - run a local server and view the development version of the app in a browser.
* `npm run build` - build a production version of the app to deploy to a website.
* `npm run lint` - lint the project source files using `eslint`.
* `npm run preview` - serve the production version of the app locally.

## Deploying to a Website
If you plan on deploying the app to a website, there are two things you must do:
1. Edit the `base` property in `vite.config.js` to point to the path on your server where the app will be deployed. After doing this, you can run `npm run build`. The property is also automatically used by `npm run dev`.
2. In `App.jsx`, edit or remove the link in the `<footer>` element which points to this repository. 

## License
This project is released under the terms of the [MIT license](./LICENSE).
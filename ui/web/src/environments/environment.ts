// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseurl: "http://localhost:3000",
  apiurl: "http://localhost:3000/api",
  geoCodeAPI: "AIzaSyCP3iX9mpRBwJ3MPdkgV2IZDejmJebtHuc",
  geoCodeUrl: "https://maps.googleapis.com/maps/api/geocode/json?latlng=",

  awsAccessKeyId: "AKIAZFPG5ENVMLXF4XXS",
  awsSecretAccessKey: "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",
  awsRegion: "us-east-2",
  awsSQSUrl: "https://sqs.us-east-2.amazonaws.com/630233834346",
  awsSQSEnv: "dev",

  socketUrl: "http://localhost:3000"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

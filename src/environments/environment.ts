// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// const serverUrl = 'http://192.168.107.184:8080/';
const serverUrl = 'https://www.caposgt.com/';
export const environment = {
  production: false,
  staging: false,
  appVersion: '1.0.1',
  appTitle: 'CaPOS',
  serverUrl: serverUrl,
  apiUrl: serverUrl + 'api/',
  paypal: {
    clientId: 'Ab0h1u-8-t5RBN4KRL8u2Nt1tT-1F2WPR_VzUEdI3iEcMFoSmFj4ustyZsAwUD8vleuXtWnpMTTOyAFp',
    secret: 'EBehWI0LXaXqEP1DdoSvS0BOwVs8T2z0cKQDJWBfwLW6829B1XtaWaUFywnVgeroAUlFGnKEkaoVZhfM'
  },
  plans:{
    free: '',
    starter: 'P-7PH38280A8086220HMDHIV3I',
    advanced: 'P-1DY470871V6943707MDHIWDA',
    multi_outlet: 'P-7N499283PH6522102MDHIWTY'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

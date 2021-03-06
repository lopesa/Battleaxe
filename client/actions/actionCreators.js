// Action creators are grouped in the App.js component
// Add new action creators to the 'bundledActionCreators' using
// Object.assign so new action creators will be bound and passed down

import ActionTypes from './actionTypes';
import config from '../config/config'
import axios from 'axios';

import firebaseApp from '../base';
const database = firebaseApp.database();


export function getDatabase(user = 'testUser') {
  return dispatch => {
    dispatch(getDBRequestedAction());
    return database.ref(`users/${user}`).once('value', snap => {
      const databaseInfo = snap.val();
      dispatch(getDBFulfilledAction(databaseInfo))
    })
    .catch((error) => {
      console.log(error);
      dispatch(getDBRejectedAction());
    });
  }
}

function getDBRequestedAction() {
  return {
    type: ActionTypes.GetDBRequested
  };
}

function getDBRejectedAction() {
  return {
    type: ActionTypes.GetDBRejected
  }
}

function getDBFulfilledAction(databaseInfo) {
  return {
    type: ActionTypes.GetDBFulfilled,
    databaseInfo
  };
}

export function setDatabase(data, user = 'testUser') {
  return dispatch => {
    // console.log(data);
    dispatch({
      type: 'SET_DATABASE',
      data
    });
  }
}

export function deleteModule(db_key, user = 'testUser') {
  return dispatch => {
    dispatch(deleteModuleRequestedAction());
    const moduleRef = database.ref(`users/${user}/modules/${db_key}`)

    moduleRef.remove()
    .then((snap) => {
      dispatch(deleteModuleFulfilledAction());
    })
    .catch((error) => {
      console.error(error);
      dispatch(deleteModuleRejectedAction());
    })
  }
}

function deleteModuleRequestedAction() {
  return {
    type: ActionTypes.DeleteModuleRequested
  };
}

function deleteModuleRejectedAction() {
  return {
    type: ActionTypes.DeleteModuleRejected
  }
}

function deleteModuleFulfilledAction(databaseInfo) {
  return {
    type: ActionTypes.DeleteModuleFulfilled
  };
}


export function getGeolocation() {
  return dispatch => {
    dispatch(getGeolocationRequestedAction());
    return navigator.geolocation.getCurrentPosition(function(position) {

      let lat = position.coords.latitude;
      let long = position.coords.longitude;

      // add to session storage for usage later
      sessionStorage.setItem('latitude', lat);
      sessionStorage.setItem('longitude', long);

      // GET CURRENT CITY

      let query = `/geolocation/${lat},${long}`

      axios.get(query)
      .then((response) => {
        let data = response.data;
        let geoStateAdditions = {
          latitude: lat,
          longitude: long,
          currentCity: data
        }
        dispatch(getGeolocationFulfilledAction(geoStateAdditions))
      })
      .catch((error) => {
        console.error(error);
      })

      // $.get(query, function(data) {
      //   // console.log(data)
      //   let geoStateAdditions = {
      //     latitude: lat,
      //     longitude: long,
      //     currentCity: data
      //   }

      //   dispatch(getGeolocationFulfilledAction(geoStateAdditions))
      // })
      // .fail(function(error) {
      //   console.log( error );
      // })
    }, error => {
      console.log(error);
      dispatch(getGeolocationRejectedAction());
    });
  }
}


function getGeolocationRequestedAction() {
  return {
    type: ActionTypes.GetGeolocationRequested
  };
}

function getGeolocationRejectedAction() {
  return {
    type: ActionTypes.GetGeolocationRejected
  }
}

function getGeolocationFulfilledAction(geoStateAdditions) {
  return {
    type: ActionTypes.GetGeolocationFulfilled,
    geoStateAdditions
  };
}
import { csrfFetch } from "./csrf";

const ALL_SPOTS = "spots/getSpots";
const SINGLE_SPOT = "spots/getSpot";
const CREATE_SPOT = "spots/createSpot"
const OWNER_SPOTS = "spots/ownerSpots"
const DELETE_SPOT = "spots/deleteSpot"
const EDIT_SPOT = "spots/editSpot"


//====ACTION CREATORS=======================================

const getSpots = (spots) => {
    return {
        type: ALL_SPOTS,
        spots
    };
};

const getSpot = (spot) => {
    return {
        type: SINGLE_SPOT,
        spot
    };
};

const createSpot = (data) => {
    return {
        type: CREATE_SPOT,
        data
    };
};

const getOwnerSpots = (spots) => {
    return {
        type: OWNER_SPOTS,
        spots
    };
};

const deleteSpot = (spot) => {
    return {
        type: DELETE_SPOT,
        spot
    };
};

const editSpot = (spot) => {
    return {
        type: EDIT_SPOT,
        spot
    };
};

//====THUNKS================================================

export const fetchSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots')

    if (response.ok) {
    const spots = await response.json()
    dispatch(getSpots(spots));
} //might need an else for errors?
}

export const fetchSpot = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}`)

    if (response.ok) {
    const spot = await response.json()
    dispatch(getSpot(spot));
    } //might need an else for errors?
}

export const fetchNewSpot = (data) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })

    if (response.ok) {
    const newSpot = await response.json()
    dispatch(createSpot(newSpot));
    return newSpot;
    } //might need an else for errors?
}

export const fetchNewSpotImgs = (data) => async (dispatch) => {
    console.log('in the thunki for imgs')
    const response = await csrfFetch(`/api/spots/${data.spotId}/images`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })

    if (response.ok) {
    const newSpot = await response.json()
    // dispatch(createSpot(newSpot));
    // return newSpot;
    } //might need an else for errors?
}

export const fetchUserSpots = () => async (dispatch) => {
    // console.log('in the thunk for user spots')
    const response = await csrfFetch(`/api/spots/current`)

    if (response.ok) {
    const ownerSpots = await response.json()
    // console.log(ownerSpots)
    dispatch(getOwnerSpots(ownerSpots));
    // return ownerSpots;
    } //might need an else for errors?
}

export const fetchDeleteSpot = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })

    console.log('in fetch delete spot', response)
    if (response.ok) {
    const deletedSpot = await response.json()
    // console.log("deleted spot thunk", deletedSpot)
    dispatch(deleteSpot(id));
    } //might need an else for errors?
}

export const fetchEditSpot = (spot) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spot.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(spot)
    })

    if (response.ok) {
    const newEditSpot = await response.json()
    // console.log('spot data from thunk', newEditSpot)
    dispatch(editSpot(newEditSpot));
    return newEditSpot;
    } //might need an else for errors?
}

//====REDUCER===============================================

const initialState = {
    allSpots: {},
    singleSpot: {}
};

const spotsReducer = (state = initialState, action) => {
    let spotState;

    switch (action.type) {

        case ALL_SPOTS:
            // console.log('spots from reducer', action.spots.Spots)
            const allSpots = action.spots.Spots
            spotState = {...state, allSpots: {...state.allSpots}, singleSpot: {...state.singleSpot}}
            // console.log('state from reducer', spotState)
            allSpots.forEach((spot) => {
                spotState.allSpots[spot.id] = spot;
              });
            return spotState;

        case SINGLE_SPOT:
            // console.log('spot action', action)
            const singleSpot = action.spot //need to log this
            // console.log('reducer single spot action', singleSpot)
            spotState = {...state, allSpots: {...state.allSpots}, singleSpot: {...state.singleSpot}}

            spotState.singleSpot = singleSpot
            // need to pass single spot action into new spot state.
            return spotState

        case CREATE_SPOT:
            //console.log to determine data after component is set up
            // console.log('are we in the reducer? ActionObj', action.data)
            spotState = {...state, allSpots: {...state.allSpots}, singleSpot: {...state.singleSpot}}

            spotState.allSpots[action.data.id] = action.data
            // console.log('reducer spotState', spotState)

            return spotState;

        case OWNER_SPOTS:
            // console.log('spots from reducer', action)
            const userSpots = action.spots.Spots
            spotState = {allSpots: {}, singleSpot: {...state.singleSpot}}
            // console.log('state from reducer', spotState)
            userSpots.forEach((spot) => {
                spotState.allSpots[spot.id] = spot;
                });
            return spotState;

            case DELETE_SPOT:
                // const userSpots = action.spots.Spots
                spotState = {allSpots: {}, singleSpot: {...state.singleSpot}}
                const currState = Object.values(state.allSpots)
                currState.forEach((spot) => {
                    if (spot.id !== action.spot) {
                        spotState.allSpots[spot.id] = spot;

                    }
                });
                return spotState;

            case EDIT_SPOT:
                //console.log to determine data after component is set up
                console.log('are we in the reducer? ActionObj', action.spot)
                spotState = {...state, allSpots: {...state.allSpots}, singleSpot: {...state.singleSpot}}

                spotState.allSpots[action.spot.id] = action.spot
                // console.log('reducer spotState', spotState)

                return spotState;

        default:
            return state;
    }
}

export default spotsReducer

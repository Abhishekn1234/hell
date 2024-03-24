// store.js
// store.js
import { createStore } from 'redux';
import reducer from './Contextreducer'; // Import your root reducer

const reduxStore = createStore(reducer); // Create the store with your root reducer

export default reduxStore;

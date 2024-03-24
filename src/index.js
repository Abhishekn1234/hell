// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './components/store'; // Import the store from store.js
import App from './App';
import { UserProvider } from './components/Usercontext';
import'./style.css';

ReactDOM.render(
  <React.StrictMode>
     <UserProvider>
    <Provider store={store}>
      <App />
    </Provider>
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);


import React from 'react'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import RoutesContainer from './components/RoutesContainer';
import { ThemeProvider, createTheme } from '@mui/material';
import { WEBSOCKET_URL } from './components/variables';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

function App() {
  const dispatch = useDispatch()


  // type: 'echo', payload: new Echo({
  //   broadcaster: 'pusher',
  //   key: '648953a3719bc642f0ce',
  //   cluster: 'mt1',
  //   wsHost: '127.0.0.1',
  //   wsPort: 6001,
  //   // authEndpoint: 'http://localhost:8000/broadcasting/auth',
  //   transports: ['websocket'],
  //   // auth: {
  //   //   headers: {
  //   //     Authorization: `Bearer ${token}`,
  //   //     Accept: 'application/json'
  //   //   },
  //   // },
  //   enabledTransports: ['ws'],
  //   forceTLS: false,
  //   disableStats: true

  React.useEffect(() => {
    window.Pusher = Pusher;
    dispatch({
      type: 'echo', payload: new Echo({
        broadcaster: 'pusher',
        key: '648953a3719bc642f0ce',
        cluster: 'mt1',
        wsHost: 'zapii.website',
        wssHost: null,
        wsPort: 6001,
        wssPort: null,
        transports: ['websocket'],
        enabledTransports: ['ws'],
        forceTLS: false,
        disableStats: true
      })
    })
  }, [])

  const theme = createTheme({
    palette: {
      primary: { main: '#3498db' },
      secondary: { main: '#1976d2' },
      yellow: { main: '#F5C469' },
      gray: { main: '#382F2D' },
    }
  })

  return (
    <ThemeProvider theme={theme}>
      <RoutesContainer />

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  )
}

export default App

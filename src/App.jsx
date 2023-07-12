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

  React.useEffect(() => {
    window.Pusher = Pusher;
    dispatch({
      type: 'echo', payload: new Echo({
        broadcaster: 'pusher',
        key: '648953a3719bc642f0ce',
        cluster: 'mt1',
        wsHost: 'zapii.website',
        wsPort: 6001,
        wssPort: 6001, // Adicione essa opção
        transports: ['websocket'],
        enabledTransports: ['ws', 'wss'],
        forceTLS: false, // Defina como true para usar "wss"
        disableStats: true,
        encrypted: false, // Defina como true para usar "wss"
      })
    })

    const selectedUser = JSON.parse(localStorage.getItem('selectedFriend'))
    if (selectedUser) {
      dispatch({ type: 'selectedFriend', payload: selectedUser })
    }

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

import React from 'react'
import { GET, POST, PUT } from '../utils/request'
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import Users from './Users';
import { BsGearFill } from 'react-icons/bs'
import { ImExit } from 'react-icons/im'
import { RiMessage2Fill } from 'react-icons/ri'
import { IconButton } from '@mui/material';
import './styles.css'
import Navbar from './Navbar';
import { getRandomColor } from '../utils/colors';
import { STORAGE_URL } from './variables';
import ViewImageModal from '../utils/ViewImageModal';

const Home = () => {
  const reduxSelectedFriend = useSelector(state => state.AppReducer.selectedFriend)
  const [selectedFriend, setSelectedFriend] = React.useState(reduxSelectedFriend)
  let friendships = useSelector(state => state.AppReducer.friendships)
  let user = useSelector(state => state.AppReducer.user)
  let echo = useSelector(state => state.AppReducer.echo)
  const dispatch = useDispatch()
  const location = useLocation();
  const history = useNavigate()

  React.useEffect(() => {
    if (!echo) {
      return
    }

    getFriendships()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [echo])

  React.useEffect(() => {
    setSelectedFriend(reduxSelectedFriend)
  }, [reduxSelectedFriend])

  React.useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '/profile') && friendships.length > 0) {
      echo.leave(`user.${user.id}`)
      echo.channel(`user.${user.id}`).listen('.SendMessage', genericMessageHandler);
      return
    }

  }, [location.pathname, friendships])

  React.useEffect(() => {
    if (!selectedFriend) {
      return
    }

    history(`chat/${selectedFriend.id}`);
    if (selectedFriend.style) {
      localStorage.setItem('default_style', JSON.stringify(selectedFriend.style))
      dispatch({ type: 'friendshipDefaultStyle', payload: selectedFriend.style })
    }
  }, [selectedFriend])

  const handleVisibilityChange = async () => {
    await PUT({ url: `profile/online/${!document.hidden}` })
  }

  const genericMessageHandler = (e) => {
    let newFriendships = []
    if (e.type === 'message') {
      newFriendships = friendships.map(item => {
        if (item.id === e.message.friendship_id) item.notification = e.unseen_messages
        return item
      })
    } else {
      newFriendships = friendships.map(item => {
        if (item.user.id === e.sender_id) item.isTyping = e.is_typing
        return item
      })
    }

    console.log('genericMessageHandler', e, newFriendships)
    dispatch({ type: 'friendships', payload: newFriendships })
  }

  const getFriendships = async () => {
    const { response, statusCode } = await GET({ url: 'friendships' })
    if (statusCode === 200) {
      // localStorage.setItem('friendships', friendships)
      dispatch({
        type: 'friendships', payload: response.friendships.map(item => {
          item.style = getRandomColor()
          return item
        })
      })
    } else {
      console.log('error status code: ', statusCode)
    }
  }
  const handleSelectFriend = (item) => {
    setSelectedFriend(item)
    dispatch({ type: 'selectedFriend', payload: item })
    localStorage.setItem('selectedFriend', JSON.stringify(item))
  }

  return (
    <div className='row h-100 justify-content-center align-items-stretch' style={{ minHeight: '100vh' }}>
      {/* --------------------Content-structure-------------------- */}
      <div className="row content bg-principal align-items-center p-0">
        {echo &&
          <div className={`${selectedFriend && 'd-md-block d-none'} col-md-3 bg-white chat p-0 shadow`} style={{ borderRadius: '.5rem 0 0 .5rem' }}>
            <Navbar user={user} />
            {friendships.map(item => (
              <div key={item.id} onClick={(e) => { e.stopPropagation(); handleSelectFriend(item) }} className={`d-flex justify-content-between align-items-center mt-2 user-info ${selectedFriend.id === item.id ? 'selected' : ''}`}>
                <div className='d-flex align-items-center'>
                  <div className="user-img">
                    {item.user.file
                      ? <ViewImageModal url={STORAGE_URL + item.user.file} classes={'rounded-50'} />
                      : <div className='no-user-img' style={item.style}>
                        <h1>{item.user.nickname.substring(0, 1).toUpperCase()}</h1>
                      </div>}
                  </div>

                  <div className="d-flex flex-column ms-2">
                    <div className="d-flex align-items-center">
                      <p>{item.user.nickname}</p>
                    </div>
                    {item.isTyping ?
                      <div className="typing-animation align-items-center d-flex">
                        <span className='small typing-animation me-1'>Digitando</span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div> :
                      <span className="small">{item.user?.status}</span>}
                  </div>
                </div>

                {item.notification !== 0 && <span className='notification'>{item.notification}</span>}
              </div>
            )
            )}
          </div>}
        <div className={`${!selectedFriend && 'd-md-flex d-none'} col-md-9 chat justify-content-between shadow`} style={{ borderRadius: '0 .5rem .5rem 0' }}>
          {echo && <Outlet />}
        </div>
        {/* ------------------------------------------------------- */}
      </div>
    </div >
  )
}

export default Home
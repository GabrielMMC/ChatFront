import React from 'react'
import { GET, POST } from '../utils/request'
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

const Home = () => {
  const [selectedFriend, setSelectedFriend] = React.useState('')
  let friendships = useSelector(state => state.AppReducer.friendships)
  let user = useSelector(state => state.AppReducer.user)
  let echo = useSelector(state => state.AppReducer.echo)
  const dispatch = useDispatch()
  const location = useLocation();

  React.useEffect(() => {
    if (!location.pathname === '/chat/') {
      return
    }

    echo.channel(`user.${user.id}`).listen('.SendMessage', async (e) => {
      if (e.message) {
        friendships.map(item => {
          if (item.id === e.message.friendship_id) item.notification = true
          return item
        })
        dispatch({ type: 'friendships', payload: friendships })
      }
    })
  }, [])

  React.useEffect(() => {
    friendships = friendships
  }, [friendships])

  const history = useNavigate()

  React.useEffect(() => {
    getFriendships()
  }, [])

  React.useEffect(() => {
    history(`chat/${selectedFriend}`);
  }, [selectedFriend])

  const getFriendships = async () => {
    const { response, statusCode } = await GET({ url: 'friendships' })
    if (statusCode === 200) {
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

  console.log('firends', friendships)

  return (
    <div className='row h-100 justify-content-center align-items-stretch' style={{ minHeight: '100vh' }}>
      {/* --------------------Content-structure-------------------- */}
      <div className="row content bg-principal align-items-center">
        <div className="col-md-3 bg-white chat p-0 shadow" style={{ borderRadius: '.5rem 0 0 .5rem' }}>
          <Navbar user={user} />
          {friendships.map(item => {
            // let style = null
            // if (!style) style = getRandomColor()
            // console.log('oporra', style)
            return (
              <div
                key={item.id}
                onClick={() => setSelectedFriend(item.id)}
                className={`d-flex align-items-center mt-2 user-info ${selectedFriend === item.id ? 'selected' : ''}`}
              >
                <div className="user-img">
                  {item.user.file
                    ? <img className='w-100 h-100 rounded-50' src={STORAGE_URL + item.user.file} alt="friend_user" />
                    : <div className='no-user-img' style={item.style}>
                      <h1>{item.user.nickname.substring(0, 1)}</h1>
                    </div>}
                </div>
                <div className="d-flex flex-column ms-2">
                  <p className={`${item.notification ? 'notification' : ''}`}>{item.user.nickname}</p>
                  <span className="small">Online</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="col-md-9 chat justify-content-between shadow" style={{ borderRadius: '0 .5rem .5rem 0' }}>
          <Outlet />
        </div>
        {/* ------------------------------------------------------- */}
      </div>
    </div >
  )
}

export default Home
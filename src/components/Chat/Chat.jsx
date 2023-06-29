import React from 'react'
import './styles.css'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { GET, POST, PUT } from '../../utils/request'
import { renderToast } from '../../utils/Alerts'
import { FaCheck, FaRegClock } from 'react-icons/fa'
import dateMask from '../../utils/masks'

const Chat = () => {
  const [message, setMessage] = React.useState('')
  const [messages, setMessages] = React.useState([])
  const [friendUser, setFriendUser] = React.useState('')
  const user = useSelector(state => state.AppReducer.user)
  const token = useSelector(state => state.AppReducer.token)
  const echo = useSelector(state => state.AppReducer.echo)
  const friendships = useSelector(state => state.AppReducer.friendships)
  const params = useParams()
  const dispatch = useDispatch()
  const messagesRef = React.useRef(null)

  React.useEffect(() => {
    getMessages()

    echo.channel(`user.${user.id}`).listen('.SendMessage', async (e) => {
      console.log('response websocket', e)
      console.log('friendships', friendships)

      if (e.message) {
        if (e.message.friendship_id === params.id) {
          setMessages(messages => [...messages, e.message])
        } else {
          friendships.map(item => {
            if (item.id === e.message.friendship_id) item.notification = true
            return item
          })
          dispatch({ type: 'friendships', payload: friendships })
        }
      }
    })

    return () => {
      // echo.channel(`user.${user.id}`).close();
    };
  }, [params.id])

  React.useEffect(() => {
    messagesRef.current.scrollIntoView({ block: 'end' })
  }, [messages])

  React.useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleVisibilityChange = async () => {
    await PUT({ url: `online/update/${!document.hidden}` })
  };

  const getMessages = async () => {
    const { response, statusCode } = await GET({ url: `messages/${params.id}` })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    setMessages(response.messages)
    setFriendUser(response.friend_user)
  }

  const handleMessageSave = async () => {
    const genericId = 'generic_' + Math.random() * 10
    setMessages([...messages, { id: genericId, content: message }])
    setMessage('')

    const { response, statusCode } = await POST({ url: 'messages/create', body: JSON.stringify({ content: message, type: 'text', reciver: friendUser.id, friendship_id: params.id }) })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }

    setMessages([...messages.filter(item => item.id !== genericId), response.message])
  }

  const renderMessage = (message) => {
    if (message.id.substring(0, 7) === 'generic') {
      return (
        <p key={message.id} className={'sender'}>{message.content}
          <span><FaRegClock color='#fff' className='ms-2' /></span>
        </p>
      )
    }

    const sender = message.sender === user.id ? true : false
    return (
      <>
        <p key={message.id} className={sender ? 'sender' : 'reciver'}>{message.content}
          <span>{sender && <FaCheck color='#fff' size={13} className='ms-2' />}</span>
        </p>
        <span className={sender ? 'ms-auto mb-3' : 'mb-3'}>{dateMask(message.created_at)}</span>
      </>
    )
  }

  return (
    <>
      <div className='d-flex flex-column py-3 position-relative h-100'>
        <div style={{ flex: '1', overflowY: 'auto' }}>
          <div className="d-flex flex-column px-sm-5" ref={messagesRef}>
            {messages.map(item => renderMessage(item))}
          </div>
        </div>
        <form className='d-flex align-items-end justify-content-end pt-3 position-sticky' onSubmit={(e) => { e.preventDefault(); handleMessageSave() }}>
          <input className='form-control' type='text' value={message} onChange={({ target }) => setMessage(target.value)} />
        </form>
      </div>
    </>
  )
}

export default Chat
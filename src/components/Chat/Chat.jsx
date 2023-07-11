import React from 'react'
import Input from './Input'
import { STORAGE_URL } from '../variables'
import { FaRegClock } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { renderToast } from '../../utils/Alerts'
import { CircularProgress, IconButton } from '@mui/material'
import { DELETE, GET } from '../../utils/request'
import { dateMask, hourMask } from '../../utils/masks'
import { useDispatch, useSelector } from 'react-redux'
import ViewImageModal from '../../utils/ViewImageModal'
import { BiCheck, BiCheckDouble } from 'react-icons/bi'
import './styles.css'
import { MdArrowBack } from 'react-icons/md'
import ChatSkeleton from './ChatSkeleton'

const Chat = () => {
  const [message, setMessage] = React.useState('')
  const [friendUser, setFriendUser] = React.useState('')
  const [currentParamsId, setCurrentParamsId] = React.useState('')
  const [messages, setMessages] = React.useState([])
  const [unseenMessages, setUnseenMessages] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCalled, setIsCalled] = React.useState(false)
  const [scrollToBottom, setScrollToBottom] = React.useState(false)
  const [openedChannels, setOpenedChannels] = React.useState(false)
  const [pagination, setPagination] = React.useState({
    totalItems: '', pageNumber: 1, perPage: 1, lastPage: ''
  })

  const user = useSelector(state => state.AppReducer.user)
  const echo = useSelector(state => state.AppReducer.echo)
  const token = useSelector(state => state.AppReducer.token)
  const friendships = useSelector(state => state.AppReducer.friendships)

  const params = useParams()
  const dispatch = useDispatch()
  const history = useNavigate()
  const messagesRef = React.useRef(null)
  const scrollRef = React.useRef(null)

  //-------------------------*-------------------------
  // Carregando mensagens e atualizando canais
  React.useEffect(() => {
    if (messages.length === 0 || params.id !== currentParamsId) {
      setLoading(true)
      setCurrentParamsId(params.id)
      getMessages(params.id, 1)
    }

    if (!params.id || !friendUser.id) {
      return
    }


    // Reabrindo canais para atualizar seus parametros de id
    echo.leave(`user.${user.id}`)
    echo.channel(`user.${user.id}`).listen('.SendMessage', messageHandler);

    echo.leave(`user.unseen_messages.${user.id}`)
    echo.channel(`user.unseen_messages.${user.id}`).listen('.MessageDisplayed', messageDisplayedHandler);
    setOpenedChannels(true)
  }, [params.id, friendUser.id])

  // Scroll para o fim do container ao atualizar o estado das mensagens
  React.useEffect(() => {
    // if (scrollToBottom) {
    messagesRef?.current?.scrollIntoView({ block: 'end' })
    // }
  }, [scrollToBottom])

  // Reabrindo canal quando o friendUser é trocado para atualizar a função de callback que depende do id de usuário
  React.useEffect(() => {
    if (!friendUser.id) return

    echo.leave(`user.status.${friendUser.id}`)
    echo.channel(`user.status.${friendUser.id}`).listen('.Status', statusHandler);
  }, [friendUser.id])

  React.useEffect(() => {
    // Reabrindo canais para atualizar seu parâmetro de friendships
    if (openedChannels) {
      echo.leave(`user.${user.id}`)
      echo.channel(`user.${user.id}`).listen('.SendMessage', messageHandler);
    }
  }, [friendships])

  React.useEffect(() => {
    if (pagination.pageNumber !== 1) {
      getMessages(params.id, pagination.pageNumber)
    }
  }, [pagination.pageNumber])

  //-------------------------*-------------------------
  // Caso o id de retorno do websocket seja igual ao chat aberto, as notificações são zeradas
  const messageDisplayedHandler = (e) => {
    if (e.friendship_id === params.id) {
      setUnseenMessages(e.unseen_messages);
    }
  }

  // Callback para quando receber retorno do websocket
  const messageHandler = (e) => {
    // Caso o tipo seja 'typing' a unica coisa que é alterada é o status de digitação do usuário
    if (e.type === 'typing') {
      // Se o usuário que está digitando for o mesmo que estiver na conversa aberta, seu status é atualizado no estado friendUser
      if (e.sender_id === friendUser.id) {
        setFriendUser({ ...friendUser, isTyping: e.is_typing })
      } else {
        // Caso contrário a lista de todos os amigos é atualizada
        const newFriendships = friendships.map(item => {
          if (item.user.id === e.sender_id) item.isTyping = e.is_typing
          return item
        })

        // Atualizando valor do redux
        dispatch({ type: 'friendships', payload: newFriendships })
        console.log('uai carallho', friendships, newFriendships)
      }
      return
    }

    // Caso o retorno do websocket seja 'message' são disparadas as funções de renderização e notificação de acordo com a conversa aberta
    if (e.message.friendship_id === params.id) {
      setMessages(messages => [...messages, e.message])
      visualizedMessage(e.message.id)
      // filterFriendshipsNotification(e.message.friendship_id, 0)
    } else {
      filterFriendshipsNotification(e.message.friendship_id, e.unseen_messages, true)
    }
  }

  // Retorno do websocket que marca status online e visto por útlimo do usuário
  const statusHandler = (e) => {
    if (e.sender_id === friendUser.id) {
      setFriendUser({ ...friendUser, online: e.is_online, last_online_date: e.last_online_date });
    }
  }

  // Filtrando notificações da lista de amizades
  const filterFriendshipsNotification = (friendshipId, notifications, toFirstPlace) => {
    if (friendships.length === 0) {
      return
    }

    // Mapeando a quantidade de conversas pendentes de acordo com a conversa aberta
    const newFriendships = friendships.map(item => {
      if (item.id === friendshipId) {
        item.notification = notifications;
        return item;
      }
      return item;
    });

    // Flag para reordenar a posição da conversa na lista de usuários
    if (toFirstPlace) {
      const friendshipIndex = newFriendships.findIndex(item => item.id === friendshipId);

      if (friendshipIndex !== -1) {
        const movedFriendship = newFriendships.splice(friendshipIndex, 1)[0];
        newFriendships.unshift(movedFriendship);
      }
    }

    // Atualizando valor do redux
    dispatch({ type: 'friendships', payload: newFriendships })
  }

  // Adicionando funções de scroll ao container das mensagens
  const handleScroll = () => {
    if (pagination.pageNumber === pagination.lastPage) {
      return
    }

    if (scrollRef.current.scrollTop === 0 && !isCalled) {
      setPagination({ ...pagination, pageNumber: pagination.pageNumber + 1 });
      setIsCalled(true);

      setTimeout(() => {
        setIsCalled(false);
      }, 500);
    }
  }

  const handleBackToHome = () => {
    dispatch({ type: 'selectedFriend', payload: '' })
    history('/')
  }

  //-------------------------*-------------------------
  // Requisição para apagar mensagens não vistas
  const visualizedMessage = async (messageId) => {
    await DELETE({ url: `messages/visualized/${messageId}` })
  };

  // Requisição para carregar mensagens da conversa
  const getMessages = async (id, pageNumber) => {
    const { response, statusCode } = await GET({ url: `messages/${id}?page=${pageNumber}` })

    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }

    // Atualizando principais estados do chat
    if (id !== currentParamsId) {
      setMessages([...response.messages])
      setPagination({ ...pagination, lastPage: response.pagination.last_page, pageNumber: 1 })
      setUnseenMessages(response.unseen_messages)
      // Atribuindo mesmo estilo de foto da lista de usuários, ao que teve a conversa aberta
      setFriendUser({ ...response.friend_user, style: JSON.parse(localStorage.getItem('default_style')) })
      filterFriendshipsNotification(params.id, 0)
      setScrollToBottom(!scrollToBottom)
      setLoading(false)
    } else {
      setMessages([...response.messages, ...messages])
      scrollRef?.current?.scrollTo(0, 2)
      setLoading(false)
    }
  }

  // Requisição para salvar mensagens
  const handleSave = async (callbackRequisition, images) => {
    // Id generico para forçar renderização das imagens antes de enviar ao servidor, assim separando mensagens enviadas de mensagens não enviadas
    const genericId = 'generic_' + Math.random() * 10
    setMessage('')
    // Lógica em caso de mensagem única e não array de imagens
    if (!images) {
      setMessages([...messages, { id: genericId, content: message }])
    }
    //Chamando função de callback vinda de componentes como Input, ImagesModal e Mic
    const { response, statusCode } = await callbackRequisition()

    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    // Lógica em caso de retorno de array de imagens
    if (response.messages) {
      let unseen = response.messages.map(message => {
        return message.id
      })
      setUnseenMessages([...unseenMessages, ...unseen])
      setMessages([...messages, ...response.messages])
      messagesRef?.current?.scrollIntoView({ block: 'end' })
      return
    }

    // Lógica em caso de mensagem única, filtrando o genericId e substituindo-o pela mensagem que foi retornada do servidor 
    setUnseenMessages([...unseenMessages, { message_id: response.message.id }])
    setMessages([...messages.filter(item => item.id !== genericId), response.message])
    messagesRef?.current?.scrollIntoView({ block: 'end' })
  }

  //-------------------------*-------------------------
  // Renderizando mensagens, às separando por data de envio
  let previousDate = ''
  const renderMessage = (message) => {
    // Válidando se é uma mensagem de id genérico para renderizar o ícone do relógio
    if (message.id.substring(0, 7) === 'generic') {
      return (
        <p key={message.id} className={'sender mb-3'}>{message.content}
          <span><FaRegClock color='#fff' className='ms-2' /></span>
        </p>
      )
    }
    let messageDate = dateMask(message.created_at)
    const sender = message.sender === user.id ? true : false

    // Comparando data da mensagem com a data da mensagem anterior, assim agrupando-as por data de envio
    if (previousDate === messageDate) {
      messageDate = null
    } else {
      previousDate = messageDate
    }

    // Renderizando conteúdo da mensagem de acordo com seu tipo
    let content = ''
    switch (message.type) {
      case 'text':
        content = (
          <p className={sender ? 'sender' : 'receiver'}>{message.content}
            {sender && <span>{unseenMessages.filter(item => item.message_id === message.id)[0] && <BiCheck color='#fff' size={22} className='ms-2' />}</span>}
            {sender && <span>{!unseenMessages.filter(item => item.message_id === message.id)[0] && <BiCheckDouble color='#fff' size={22} className='ms-2' />}</span>}
          </p>)
        break

      case 'image':
        content = (
          <div className={sender ? 'sender p-0 image-container' : 'receiver p-0 image-container'} style={{ maxWidth: '49%', borderRadius: '.4rem' }}>
            <ViewImageModal url={STORAGE_URL + message.content} classes={'rounded'} />
            {sender && (
              <span className='span-image px-1'>
                {unseenMessages.filter(item => item.message_id === message.id)[0] ? (
                  <BiCheck color='#fff' size={22} />
                ) : (
                  <BiCheckDouble color='#fff' size={22} />
                )}
              </span>
            )}
          </div>
        )
        break

      case 'audio':
        content = (
          <div className={sender ? 'sender' : 'receiver'}>
            <audio controls>
              <source src={STORAGE_URL + message.content} type="audio/webm" />
            </audio>

            {sender && <span className='span-audio px-1'>{unseenMessages.filter(item => item.message_id === message.id)[0] && <BiCheck color='#fff' size={22} className='ms-2' />}</span>}
            {sender && <span className='span-audio px-1'>{!unseenMessages.filter(item => item.message_id === message.id)[0] && <BiCheckDouble color='#fff' size={22} className='ms-2' />}</span>}
          </div>
        )
        break
    }

    // Retorno completo da função montada
    return (
      <div className='d-flex flex-column' key={message.id}>
        {messageDate && <p className='date-divider mt-4 m-auto'>
          {messageDate === dateMask(new Date()) ? 'Hoje' : messageDate}
        </p>}
        {content}
        <span className={sender ? 'ms-auto mb-3' : 'mb-3'}>{hourMask(message.created_at)}</span>
      </div>
    )
  }


  return (
    <>
      {!loading ?
        <div className='d-flex flex-column px-md-5 py-3 position-relative h-100'>
          <div className="d-flex align-items-center justify-content-start py-3 position-sticky">
            {/* -------------------------Usuário-selecionado------------------------- */}
            <div className="d-md-none d-block">
              <IconButton onClick={handleBackToHome}>
                <MdArrowBack />
              </IconButton>
            </div>
            <div className="user-img">
              {friendUser.file
                ? <ViewImageModal url={STORAGE_URL + friendUser.file} classes={'rounded-50'} />
                : <div className='no-user-img' style={friendUser.style}>
                  <h1>{friendUser.nickname.substring(0, 1).toUpperCase()}</h1>
                </div>}
            </div>

            <div className="d-flex flex-column ms-2">
              <p className='bolder'>{friendUser.nickname}</p>
              {!friendUser.isTyping ?
                <span className="small">
                  {friendUser.online
                    ? 'Online'
                    : `Visto por último ${dateMask(friendUser.last_online_date) === dateMask(new Date()) ? 'hoje' : 'em ' + dateMask(friendUser.last_online_date)} às ${hourMask(friendUser.last_online_date)}`}
                </span> :
                <div className="typing-animation align-items-center d-flex">
                  <span className='small typing-animation me-1'>Digitando</span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              }
            </div>
          </div>
          {/* -------------------------Mensagens-da-conversa------------------------- */}
          <div style={{ flex: '1', overflowY: 'auto' }} ref={scrollRef} onScroll={handleScroll}>
            <div className="d-flex flex-column" ref={messagesRef}>
              {messages.map(item => renderMessage(item))}
            </div>
          </div>
          {/* -------------------------Componente-dos-inputs------------------------- */}
          <Input friendUser={friendUser} handleSave={handleSave} setMessages={setMessages} />
        </div> :
        <ChatSkeleton />
      }
    </>
  )
}

export default Chat
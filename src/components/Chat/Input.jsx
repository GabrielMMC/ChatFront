import { IconButton } from '@mui/material';
import React from 'react'
import { BsSendFill, BsFillMicFill } from 'react-icons/bs'
import { MdPhotoLibrary } from 'react-icons/md'
import ImagesModal from './ImagesModal';
import { useParams } from 'react-router-dom';
import { POST, PUT } from '../../utils/request';
import Mic from './Mic';
import { renderToast } from '../../utils/Alerts';

//Props comming from ./Chat.jsx
const Input = ({ friendUser, handleSave, setMessages }) => {
  const [images, setImages] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const inputRef = React.useRef(null);
  const typingRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const params = useParams()

  React.useEffect(() => {
    inputRef.current.focus();
  }, []);

  React.useEffect(() => {
    changeIsTypingStatus()
  }, [isTyping])

  const changeIsTypingStatus = async () => {
    await PUT({ url: `profile/is_typing/${isTyping}/${friendUser.id}` })
  }

  const handleMessageSave = () => {
    if (!message) {
      return
    }

    setMessage('')

    if (message.length > 1500) {
      renderToast({ type: 'error', message: 'Proibido trava zap aqui corno manso' })
      return
    }

    handleSave(async () => {
      const { response, statusCode } = await POST({
        url: 'messages/create', body: JSON.stringify({
          content: message,
          type: 'text',
          receiver: friendUser.id,
          friendship_id: params.id
        })
      })

      return { response, statusCode }
    }
    )
  }

  const handleMessageChange = ({ value }) => {
    setMessage(value)
    if (!isTyping) {
      setIsTyping(true)
    }
    clearTimeout(typingRef.current)
    typingRef.current = setTimeout(() => setIsTyping(false), 500)
  }

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  }

  // Handles changes to file input fields and updates the form state with the selected file and its URL
  const handleFileChange = (e) => {
    const files = e.target.files;

    const filePromises = []
    for (let i = 0; i < 4; i++) {
      if (files[i] !== undefined) {
        const fr = new FileReader()
        filePromises.push(new Promise((resolve) => {
          fr.onload = (e) => {
            resolve({ value: files[i], url: e.target.result })
          }
          fr.readAsDataURL(files[i])
        }))
      }
    }

    Promise.all(filePromises).then((fileDataArray) => {
      setImages(fileDataArray)
    })
  }


  return (
    <form className='d-flex align-items-end pt-3 position-sticky' onSubmit={(e) => { e.preventDefault(); handleMessageSave() }}>
      <div className='input-group'>
        <input
          className='form-control'
          type='text'
          ref={inputRef}
          value={message}
          onChange={({ target }) => handleMessageChange(target)}
        />
        <div className='input-send'>
          <IconButton type='submit'>
            <BsSendFill color='#EAF6FE' />
          </IconButton>
        </div>
      </div>

      <Mic handleSave={handleSave} friendUser={friendUser} />

      <IconButton className='ms-2 hover-0' color='primary' onClick={handleFileInputClick}>
        <input
          hidden
          ref={fileInputRef}
          className='ms-2 hover-0'
          onChange={handleFileChange}
          name='file'
          accept="image/*"
          multiple
          type="file"
        />
        <MdPhotoLibrary color='#EAF6FE' />
      </IconButton>

      <ImagesModal images={images} setImages={setImages} friendUser={friendUser} handleSave={handleSave} setMessages={setMessages} />
    </form>
  )
}

export default Input
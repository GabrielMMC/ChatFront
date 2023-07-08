import React from 'react'
import { IconButton } from '@mui/material';
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { POST } from '../../utils/request';

// Props comming from ./Input.jsx
const Mic = ({ handleSave, friendUser }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const mediaRecorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  const params = useParams()

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start();
        mediaRecorderRef.current.addEventListener('stop', sendRecordingToServer);
        setIsRecording(true);
      })
      .catch((error) => {
        console.error('Erro ao acessar o dispositivo de áudio:', error);
      });
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      chunksRef.current.push(e.data);
    }
  };

  const sendRecordingToServer = () => {
    const formData = new FormData();
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    formData.append('audio', blob, 'recording.webm');
    formData.append('type', 'audio');
    formData.append('receiver', friendUser.id);
    formData.append('friendship_id', params.id);

    chunksRef.current = [];

    handleSave(async () => {
      const { response, statusCode } = await POST({
        url: 'messages/create/audios', body: formData
      })

      console.log('resp', response)
      return { response, statusCode }
    })
  };

  return (
    <>
      {!isRecording ?
        <IconButton onClick={startRecording} className='ms-2 hover-0' color='primary'>
          <BsFillMicFill color='#EAF6FE' />
        </IconButton> :
        <IconButton onClick={stopRecording} className='ms-2 hover-0' color='primary'>
          <BsFillMicMuteFill color='#EAF6FE' />
        </IconButton>}
    </>
  )
}

export default Mic
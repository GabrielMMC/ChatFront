import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import { MdClose } from 'react-icons/md';
import { BsSendFill } from 'react-icons/bs'
import { useParams } from 'react-router-dom';
import { POST } from '../../utils/request';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '.4rem',
  padding: '10px 0 10px 0'
};

//Props comming from ./Input.jsx
const ImagesModal = ({ images, setImages, friendUser, handleSave, setMessages }) => {
  const [open, setOpen] = React.useState(false);
  const params = useParams()

  React.useEffect(() => {
    if (images.length > 0) handleOpen()
  }, [images])

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setImages([]) };

  const handleImageSave = async () => {
    const body = new FormData()

    body.append('type', 'image')
    body.append('receiver', friendUser.id)
    body.append('friendship_id', params.id)
    images.forEach(item => {
      body.append('images[]', item.value)
    });

    handleSave(async () => {
      let newMessages = []
      images.forEach(item => {
        const genericId = 'generic_' + Math.random() * 10
        newMessages = [...newMessages, { id: genericId, content: item.url, type: 'image' }]
      })

      setMessages(messages => [...messages, ...newMessages])

      const { response, statusCode } = await POST({
        url: 'messages/create/images', body
      })

      handleClose()
      return { response, statusCode }
    }, images)
  }

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <div className="d-flex justify-content-end mb-2">
              <IconButton className='me-2' onClick={handleClose}>
                <MdClose />
              </IconButton>
            </div>
            <div className="carousel slide" id="carouselExampleCaptions">
              <div className="carousel-inner">
                {images.map((item, index) => (
                  <div key={index} className={`carousel-item ${index === 0 && 'active'}`}>
                    {console.log('item image', item)}
                    <img src={item.url} className="d-block w-100" alt={'Image ' + index} />
                  </div>
                ))}
              </div>
              <button className="carousel-control-prev bg-dark" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button className="carousel-control-next bg-dark" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Próximo</span>
              </button>
            </div>

            <div className="d-flex justify-content-end mt-2">
              <IconButton className='me-2' onClick={handleImageSave}>
                <BsSendFill />
              </IconButton>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export default ImagesModal
import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { IconButton } from '@mui/material';
import { MdClose } from 'react-icons/md';

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
const ViewImageModal = ({ url, classes }) => {
  const [open, setOpen] = React.useState(false);
  const [currentImage, setCurrentImage] = React.useState({ url: '', loaded: false });

  React.useEffect(() => {
    setCurrentImage({ url: url, loaded: false })
  }, [url])

  const handleOpen = (e) => {
    e.stopPropagation()
    setOpen(true)
  };
  const handleClose = () => setOpen(false);
  return (
    <div>
      <div onClick={handleOpen}>
        <img className={`img-fluid pointer ${classes}`} src={currentImage.url} onLoad={() => setCurrentImage({ ...currentImage, loaded: true })} alt="view_image" />
      </div>
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
            <div className="position-relative">
              <img src={currentImage.url} className="w-100" alt="image_content" />
              <div className="position-absolute top-0 end-0 m-2" style={{ backgroundColor: ' rgba(0, 0, 0, .4)', borderRadius: '50%' }}>
                <IconButton onClick={handleClose}>
                  <MdClose color='#FFF' />
                </IconButton>
              </div>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export default ViewImageModal
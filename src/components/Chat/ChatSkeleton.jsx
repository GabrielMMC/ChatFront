import { Skeleton } from '@mui/material'
import React from 'react'

const ChatSkeleton = () => {
  const [skeletonElements, setSkeletonElements] = React.useState([])
  const loadingRef = React.useRef(null)

  React.useEffect(() => {
    if (loadingRef.current) {
      // Gerar um número aleatório para width entre 50px e 50% da tela
      const totalItems = Math.floor((loadingRef.current?.clientHeight - 450) / 56)
      const totalElements = [];
      const minWidth = 50;

      for (let i = 0; i <= totalItems; i++) {
        // Gerar um número aleatório entre 0 e 1
        const randomNum = Math.random();
        // Definir a classe com base no número aleatório
        const className = randomNum < 0.5 ? 'sender mb-3' : 'receiver mb-3';
        const maxWidth = loadingRef.current?.clientWidth * 0.5;
        const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;

        totalElements.push(
          <Skeleton variant="rounded" width={width} height={56} className={className} key={i} />
        );
      }
      console.log('renderixou', totalElements)
      setSkeletonElements(totalElements)
    }
  }, [loadingRef.current])


  return (
    <div className='d-flex flex-column px-md-5 py-3 position-relative h-100' ref={loadingRef}>
      <div className="d-flex align-items-center justify-content-start py-3 position-sticky">

        <div className="user-img profile-margin">
          <Skeleton variant="circular" width={65} height={65} />
        </div>

        <div className="d-flex flex-column ms-2">
          <Skeleton variant="rounded" width={120} height={24} />
          <Skeleton variant="rounded" width={70} height={15} className='mt-2' />
        </div>
      </div>

      <div style={{ flex: '1', overflowY: 'auto' }}>
        <div className="d-flex flex-column mt-4">
          {skeletonElements.map(item => (
            item
          ))}
        </div>
      </div>

      {loadingRef.current &&
        <div className='d-flex align-items-end pt-3 position-sticky'>
          <Skeleton variant="rounded" width={loadingRef.current.clientWidth - 100} height={40} />
          <Skeleton variant="circular" width={40} height={40} className='ms-2' />
          <Skeleton variant="circular" width={40} height={40} className='ms-2' />
        </div>}

    </div >
  )
}

export default ChatSkeleton
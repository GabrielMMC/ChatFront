import React from 'react'
import Users from './Users'
import { IconButton } from '@mui/material'
import { BsGearFill } from 'react-icons/bs'
import { ImExit } from 'react-icons/im'
import swal from 'sweetalert'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getRandomColor } from '../utils/colors'
import { STORAGE_URL } from './variables'

const Navbar = ({ user }) => {
  const [style, setStyle] = React.useState(getRandomColor())
  const dispatch = useDispatch()
  const history = useNavigate()

  const handleLogoff = () => {
    return (
      swal({
        title: `Desconectar`,
        text: `Deseja realmente se desconectar?`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then(async (willDelete) => {
        if (willDelete) {
          // swal(`Desconectado com sucesso!`, {
          //   icon: "success",
          // });
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('friendships')
          localStorage.removeItem('echo')
          dispatch({ type: 'logout', payload: '' })
        }
      })
    )
  }

  return (
    <nav className='d-flex p-2 justify-content-between align-items-center'>
      <div className="d-flex align-items-center">
        <div className="user-image" style={{ minWidth: 60, height: 60 }}>
          {user.file
            ? <img className='w-100 h-100 rounded-50' src={STORAGE_URL + user.file} alt="user" />
            : <div className='no-user-img' style={style}>
              <h1>{user.nickname.substring(0, 1)}</h1>
            </div>}
        </div>

        <div className="d-flex flex-column ms-2">
          <p>{user.nickname}</p>
        </div>
      </div>

      <div className='d-flex'>
        <Users />
        {/* <IconButton> <RiMessage2Fill /></IconButton> */}
        <IconButton onClick={() => history('/profile')}><BsGearFill /></IconButton>
        <IconButton onClick={handleLogoff}> <ImExit /></IconButton>
      </div>
    </nav>
  )
}

export default Navbar
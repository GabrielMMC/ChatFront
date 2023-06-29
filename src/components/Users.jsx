import React from 'react'
import { FaUsers, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { IoMdPersonAdd, IoMdSearch } from 'react-icons/io';
import { Box, IconButton, Menu, MenuItem, Pagination, Tooltip } from '@mui/material';
import { DELETE, GET, POST, PUT } from '../utils/request';
import { useDispatch, useSelector } from 'react-redux';
import { renderToast } from '../utils/Alerts';

const Users = () => {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [users, setUsers] = React.useState([])
  const [invites, setInvites] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [message, setMessage] = React.useState('Pesquise pelo nickname dos usuários')
  const [pagination, setPagination] = React.useState({
    totalItems: '', pageNumber: 0, perPage: 10
  })
  const user = useSelector(state => state.AppReducer.user)
  const echo = useSelector(state => state.AppReducer.echo)
  const dispatch = useDispatch()

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  React.useEffect(() => {
    echo.channel(`user.invites.${user.id}`).listen('.Invites', (e) => {
      console.log('response websocket invites', e.new_invite)
      setInvites([...invites, e.new_invite])
    })
  }, [])

  React.useEffect(() => {
    if (anchorElUser) {
      getInvites()
    }
  }, [anchorElUser])

  React.useEffect(() => {
    if (!search) {
      setUsers([])
      setMessage('Pesquise pelo nickname dos usuários')
      return
    }
    if (anchorElUser) {
      getDisponibleUsers()
    }
  }, [anchorElUser, search])

  const getInvites = async () => {
    const { response, statusCode } = await GET({ url: 'friendships/get_invites' })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    setInvites(response.invites)
  }

  const getDisponibleUsers = async () => {
    const { response, statusCode } = await GET({ url: `friendships/get_disponible_users?search=${search}` })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }

    setUsers(response.users)
    if (response.users.length === 0) {
      setMessage('Nenhum usuário encontrado')
    }

  }

  const handleInviteFriend = async (id) => {
    const { response, statusCode } = await POST({ url: 'friendships/create', body: JSON.stringify({ friend_user_id: id }) })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    // setUsers(response.users)
    setUsers(users.filter(item => item.id !== id))
  }

  const handleAcceptFriend = async (id) => {
    const { response, statusCode } = await PUT({ url: `friendships/update/${id}` })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    setInvites(invites.filter(item => item.id !== id))
    dispatch({ type: 'friendships', payload: invites.filter(item => item.id === id)[0].user })
  }

  const handleDeclineFriend = async (id) => {
    const { response, statusCode } = await DELETE({ url: `friendships/delete/${id}` })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    setInvites(invites.filter(item => item.id !== id))
  }

  let timeout
  const handleSearchChange = ({ target }) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => { setSearch(target.value); setPagination({ ...pagination, pageNumber: 0 }) }, 750)
  }

  return (
    <>
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu}><FaUsers /></IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: '40px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <div className="input-group px-2">
            <input type="text" className='form-control' onChange={handleSearchChange} />
            <div className="bg-red" style={{ borderRadius: '0 5px 5px 0' }}>
              <IoMdSearch className='m-2' size={20} color='#FFF' />
            </div>
          </div>

          {users.length > 0 ?
            users.map(item => (
              <MenuItem className='d-flex justify-content-between' key={item.id}>
                <p>{item.nickname}</p>
                <IconButton onClick={() => handleInviteFriend(item.id)}><IoMdPersonAdd /></IconButton>
              </MenuItem>
            ))
            : <p className='text-center'><i>{message}</i></p>}

          {users.length > 0 && pagination.totalItems &&
            <div className='d-flex justify-content-end'>
              <Pagination color='primary' shape="rounded" count={Math.ceil(pagination.totalItems / pagination.perPage)}
                page={pagination.pageNumber + 1} onChange={(e, page) => {
                  window.scrollTo(0, 0); setPagination({ ...pagination, pageNumber: page - 1 })
                }
                } />
            </div>}

          <p className='ms-3 mt-4'>Convites pendentes</p>
          {invites.length > 0 ?
            invites.map(item => (
              <MenuItem className='d-flex justify-content-between anime-left' key={item.id}>
                <p>{item.user.nickname}</p>
                <div>
                  <IconButton color='#FFFF00' onClick={() => handleAcceptFriend(item.id)}><FaUserCheck color='#1976d2' /></IconButton>
                  <IconButton onClick={() => handleDeclineFriend(item.id)}><FaUserSlash color='#d32f2f' /></IconButton>
                </div>
              </MenuItem>
            ))
            : <p className='ms-3'><i>Nenhum convite recebido</i></p>}
        </Menu>

      </Box>
    </>
  )
}

export default Users
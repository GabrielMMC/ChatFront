import React from 'react'
import { STORAGE_URL } from '../variables'
import { CircularProgress, Skeleton } from '@mui/material'
import { GET, POST } from '../../utils/request'
import { renderToast } from '../../utils/Alerts'
import { getRandomColor } from '../../utils/colors'
import './styles.css'
import { Button } from '@mui/material'
import useForm from '../../utils/useForm'
import { useDispatch } from 'react-redux'

const Profile = () => {
  const [validNickname, setValidNickname] = React.useState(false)
  const [style, setStyle] = React.useState({})
  const { form, setForm, errors, handleChange, handleFileChange, handleBlur, setError, isValid } = useForm({
    nickname: '',
    status: '',
    file: { value: '', url: '' },
    loading: true
  })
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loadingSave, setLoadingSave] = React.useState(false)
  const dispatch = useDispatch()

  React.useEffect(() => {
    getUserData()
  }, [])

  const getUserData = async () => {
    const { response, statusCode } = await GET({ url: 'profile' })
    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.message })
      return
    }
    const { nickname, status, file } = response.user
    setForm({
      nickname,
      status: status || '',
      file: file ? { value: '', url: STORAGE_URL + file } : { value: '', file: '' },
      loading: false
    })
    setStyle(getRandomColor())
  }

  const handleSave = async () => {
    const valid = isValid(['file', 'status', 'loading'])

    if (!valid || errors.nickname) {
      return
    }

    setLoadingSave(true)
    const formData = new FormData()
    formData.append('image', form.file.value)
    formData.append('nickname', form.nickname)
    formData.append('status', form.status)

    const { response, statusCode } = await POST({ url: 'profile/update', body: formData })
    setLoadingSave(false)

    if (statusCode !== 200) {
      renderToast({ type: 'error', message: response.debug.error })
      return
    }
    localStorage.setItem("user", JSON.stringify(response.user))
    dispatch({ type: 'user', payload: response.user })
    renderToast({ type: 'success', message: response.message })
  }

  const handleNicknameValidate = async () => {
    const { response, statusCode } = await GET({ url: `profile/nickname/${form.nickname}` })
    if (statusCode !== 200) {
      setValidNickname(false)
      setError('nickname', response.debug.error)
      return false
    }

    setValidNickname(true)
    setError('nickname', '')
    return true
  }
  console.log('eerors', errors)
  return (
    <div className='d-flex justify-content-center p-4 h-100'>
      {!form.loading ?
        <form className='profile d-flex justify-content-center align-items-center flex-column' onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <div className="profile-img">
            <Button className='file-button' component="label" sx={{ fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
              {form.file?.url
                ? <img src={form.file?.url} className='w-100 h-100 rounded-50' />
                : <div className='no-profile-img w-100' style={style}>
                  <h1>{form.nickname.substring(0, 1)}</h1>
                </div>}
              <input hidden onChange={handleFileChange} name='file' accept="image/*" multiple type="file" />
            </Button>
          </div>

          <div className='my-2'>
            <label htmlFor="nickname">Nickname <span className='error'>*</span></label>
            <input
              type="text"
              placeholder='xXOsvairXx'
              className={`form-control ${errors.nickname ? 'is-invalid' : ''} ${(validNickname && !errors.nickname) ? 'is-valid' : ''}`}
              id='nickname'
              name='nickname'
              value={form.nickname}
              onChange={handleChange} onBlur={handleNicknameValidate}
            />
            <span className='small error'>{errors.nickname}</span>
          </div>

          <div className='my-2'>
            <label htmlFor="status">Status</label>
            <input
              type="text"
              placeholder='Disponível'
              className='form-control'
              id='status'
              name='status'
              value={form.status}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <div className="d-flex actions mt-4">
              <Button className='ms-auto' color='primary' variant='contained' type='submit'>{loadingSave ? <CircularProgress color='inherit' size={25} /> : 'Salvar'}</Button>
            </div>
          </div>

        </form>
        :
        <div className='profile d-flex justify-content-center align-items-center flex-column'>
          <Skeleton width={150} height={150} variant='circular' />

          <div className="my-2">
            <Skeleton width={88} height={22} variant='retangular' />
            <Skeleton className='mt-1' width={300} height={38} variant='retangular' />
          </div>

          <div className="my-2">
            <Skeleton width={88} height={22} variant='retangular' />
            <Skeleton className='mt-1' width={300} height={38} variant='retangular' />

            <div className="d-flex my-2">
              <Skeleton className='mt-1 ms-auto' width={90} height={37} variant='retangular' />
            </div>
          </div>

        </div>
      }
    </div>
  )
}

export default Profile
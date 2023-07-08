import React from 'react'
import useForm from '../../utils/useForm'
import { useDispatch } from 'react-redux'
import { POST } from '../../utils/request'
import { emailRegex } from '../../utils/regex'
import { useNavigate } from 'react-router-dom'
import TextFieldInput from '../../utils/TextFieldInput'
import { Button, CircularProgress } from '@mui/material'
import './styles.css'

const Register = () => {
  const { form, errors, handleChange, handleBlur, setErrors } = useForm({
    nickname: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loadingSave, setLoadingSave] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const history = useNavigate()
  const dispatch = useDispatch()

  const handleSave = async () => {
    let newErrors = {}
    setErrorMessage('')

    //Validating if there are blank fields
    Object.keys({ ...form }).forEach(item => { if (!form[item]) newErrors[item] = 'Campo em branco' })
    //Checking if the email has valid characters
    if (!emailRegex().test(form.email)) newErrors.email = 'Email inválido'

    //If the errors object is empty, the request is made, otherwise the errors state is updated
    if (Object.keys(newErrors).length !== 0) setErrors(newErrors)
    else {
      setLoadingSave(true)
      const { response, statusCode } = await POST({ url: 'auth/register', body: JSON.stringify(form) })

      if (statusCode === 200) {
        // history('/login')
      } else {
        setErrorMessage(response.message)
      }
      setLoadingSave(false)
    }
  }

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <form className="login bg-white" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <div className="p-sm-5 p-3">
          <h1 className='title'>Zap II</h1>
          <TextFieldInput
            name='nickname'
            label='Apelido'
            value={form.nickname}
            onChange={handleChange}
            helperText={errors?.nickname}
            onBlur={handleBlur}
            error={Boolean(errors.nickname)}
          />
          <TextFieldInput
            name='email'
            label='Email'
            value={form.email}
            onChange={handleChange}
            helperText={errors?.email}
            onBlur={handleBlur}
            error={Boolean(errors.email)}
          />
          <TextFieldInput
            name='password'
            label="Senha"
            error={Boolean(errors.password)}
            helperText={errors?.password}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <TextFieldInput
            name='confirm_password'
            label="Confirme a senha"
            error={Boolean(errors.confirm_password)}
            helperText={errors?.confirm_password}
            value={form.confirm_password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <div className="d-flex align-items-center mt-3 flex-wrap">
            <p>Já possui uma conta? <a className='pointer link' onClick={() => history('/login')}>faça o login!</a></p>
            <Button className='ms-auto button' variant='contained' type='submit'>
              {loadingSave ?
                <CircularProgress size={25} color='inherit' />
                : 'Entrar'}
            </Button>
          </div>
          {errorMessage && <p className='error'>{errorMessage}</p>}
        </div>
      </form>
    </div>
  )
}

export default Register
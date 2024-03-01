import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const Login = ({ setToken, show }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login] = useMutation(LOGIN)

  if (!show) {
    return null
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const result = await login({ variables: { username, password } })
      window.localStorage.setItem('loggedinUser-token', result.data.login.value)
      setToken(result.data.login.value)
    } catch (error) {
      console.log(error)
    }

    setUsername('')
    setPassword('')
  }

  return (
    <form onSubmit={handleLogin}>
      name
      <input
        type="text"
        value={username}
        onChange={({ target }) => setUsername(target.value)}
      />
      <br />
      password
      <input
        type="password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />
      <br />
      <button type="submit">login</button>
    </form>
  )
}

export default Login

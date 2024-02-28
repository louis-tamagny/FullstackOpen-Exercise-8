import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'

const AuthorBorn = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const handleUpdateAuthor = (event) => {
    event.preventDefault()

    updateAuthor({ variables: { name, born: Number(born) } })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={handleUpdateAuthor}>
        name
        <input
          type="text"
          onChange={({ target }) => setName(target.value)}
          value={name}></input>
        <br />
        born
        <input
          type="text"
          onChange={({ target }) => setBorn(target.value)}
          value={born}></input>
        <br />
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default AuthorBorn

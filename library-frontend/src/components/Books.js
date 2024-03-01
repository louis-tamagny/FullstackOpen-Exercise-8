import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const [genreArray, setGenreArray] = useState([])
  const result = useQuery(ALL_BOOKS, { variables: { genre } })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const genreList = [...genreArray]
  result.data.allBooks.forEach((book) => {
    book.genres.forEach((genre) => {
      if (!genreList.includes(genre)) {
        genreList.push(genre)
      }
    })
  })
  if (genreList.length > genreArray.length) {
    setGenreArray(genreList)
  }

  return (
    <div>
      <h2>books</h2>
      {genre ? (
        <p>
          in genre <b>{genre}</b>
        </p>
      ) : null}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genreArray.map((g, index) => (
        <button key={index} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
      <button onClick={() => setGenre(null)}>all genres</button>
    </div>
  )
}

export default Books

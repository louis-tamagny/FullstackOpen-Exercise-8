import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME, MY_RECOMMENDED } from '../queries'

const RecommendedBooks = (props) => {
  const result = useQuery(MY_RECOMMENDED)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>
      <p>
        books in your favorite genre <b>{result.data.me.favoriteGenre}</b>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.myRecommendedBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecommendedBooks

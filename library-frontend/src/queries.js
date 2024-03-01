import { gql } from '@apollo/client'

// QUERIES

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query ($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

export const MY_RECOMMENDED = gql`
  query {
    me {
      favoriteGenre
    }
    myRecommendedBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

// MUTATIONS

export const ADD_BOOK = gql`
  mutation (
    $title: String!
    $author: String!
    $published: Int
    $genres: [String!]
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

export const UPDATE_AUTHOR = gql`
  mutation ($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation ($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

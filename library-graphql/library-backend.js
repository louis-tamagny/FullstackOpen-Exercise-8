const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v4: uuidv4 } = require('uuid')
const { GraphQLError } = require('graphql')
const mongoose = require('mongoose')
require('dotenv').config()
const Book = require('./models/book')
const Author = require('./models/author')
/*
let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963,
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821,
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime'],
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution'],
  },
]
*/
const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    author: Author!
    published: Int
    genres: [String!]
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]
  }

  type Mutation {
    addBook(title: String!
      author: String!
      published: Int
      genres: [String!]): Book!
    editAuthor(name: String!
      setBornTo: Int!): Author

  }
`

const resolvers = {
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: root._id })
      return books.length
    },
  },

  Query: {
    bookCount: async () => {
      const books = await Book.find()
      return books.length
    },
    authorCount: async () => {
      const authors = await Author.find()
      return authors.length
    },
    allBooks: async (root, args) => {
      let books = args.genre
        ? await Book.find({ genres: args.genre }).populate('author')
        : await Book.find().populate('author')
      return books
    },
    allAuthors: async () => {
      const authors = await Author.find()
      return authors
    },
  },

  Mutation: {
    addBook: async (root, args) => {
      const book = { ...args }

      const bookDuplicate = await Book.findOne({ title: book.title })
      if (bookDuplicate) {
        throw new GraphQLError('Book already exists', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.title },
        })
      }

      let author = await Author.findOne({ name: book.author })
      if (!author) {
        author = new Author({ name: book.author })
        await author.save()
      }
      const newBook = new Book({ ...book, author: author })

      try {
        await newBook.save()
      } catch (error) {
        console.log(error)
      }

      return newBook
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (author) {
        author.born = args.setBornTo
        await author.save()
        return author
      }
      return null
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to mongoDB'))
  .catch((error) => console.log(error))

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v4: uuidv4 } = require('uuid')
const { GraphQLError } = require('graphql')
const mongoose = require('mongoose')
require('dotenv').config()
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const jwt = require('jsonwebtoken')

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

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
    me: User
    myRecommendedBooks: [Book!]
  }

  type Mutation {
    addBook(title: String!
      author: String!
      published: Int
      genres: [String!]): Book!
    editAuthor(name: String!
      setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token

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
      const books = args.genre
        ? await Book.find({ genres: args.genre }).populate('author')
        : await Book.find().populate('author')
      return books
    },
    allAuthors: async () => {
      const authors = await Author.find()
      return authors
    },
    me: async (root, args, { currentUser }) => {
      return currentUser
    },
    myRecommendedBooks: async (root, args, { currentUser }) => {
      const books = await Book.find({
        genres: currentUser.favoriteGenre,
      }).populate('author')
      return books
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('invalid access token', {
          extensions: { code: 'INVALID_ACCESS_TOKEN' },
        })
      }

      const book = { ...args }

      if (args.author.length < 4) {
        throw new GraphQLError(
          'author name must be at least 4 characters long',
          {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.author },
          }
        )
      }
      if (args.title.length < 5) {
        throw new GraphQLError(
          'book title must be at least 5 characters long',
          {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.title },
          }
        )
      }

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
      await newBook.save()

      return newBook
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('invalid access token', {
          extensions: { code: 'INVALID_ACCESS_TOKEN' },
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (author) {
        author.born = args.setBornTo
        await author.save()
        return author
      }
      return null
    },
    createUser: async (root, args) => {
      const newUser = new User({ ...args })
      try {
        await newUser.save()
      } catch (error) {
        console.log(error)
        throw new GraphQLError(error.message, {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.username },
        })
      }
      return newUser
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'password') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args },
        })
      }
      const token = {
        value: jwt.sign(
          { username: user.username, id: user.id },
          process.env.JWT_SECRET
        ),
      }

      return token
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

  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

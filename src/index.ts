import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql

  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }

  # Bookを追加するmutationを追記
  type Mutation {
    addBook(title: String, author: String): Book
  }
`;

const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
    },
  ];

const resolvers = {
    Query: {
        books: () => books,
    },
    Mutation: {
        addBook(parent, args: {title:string, author: string}){
            const book = {
                author: args.author,
                title: args.title,
            };
            books.push(book)
            return book;
        }
      }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  
  console.log(`🚀  Server ready at: ${url}`);
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { addResolversToSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import type { Resolvers } from "./generated/graphql"

const prisma = new PrismaClient()

async function main() {
  // await prisma.book.create({
  //   data:{
  //     title: "intial-title",
  //     author: "initial-author"
  //   }
  // });

  const allBooks = await prisma.book.findMany()
  console.log(allBooks)

const schema = loadSchemaSync('src/typedefs/schema.graphql', {
  loaders: [new GraphQLFileLoader()],
});


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

const resolvers: Resolvers = {
  Query: {
    books: () => books,
  },
  Mutation: {
    addBook(parent, args) {
      const book = {
        author: args.author,
        title: args.title,
      };
      books.push(book)
      return book;
    }
  }
};


const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const server = new ApolloServer({ schema: schemaWithResolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
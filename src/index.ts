import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { addResolversToSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import type { Resolvers } from "./generated/graphql"

const prisma = new PrismaClient()

interface Context {
  dbsource: {
    prisma: PrismaClient;
  }
}

async function main() {

  const schema = loadSchemaSync('src/typedefs/schema.graphql', {
    loaders: [new GraphQLFileLoader()],
  });



  const resolvers: Resolvers = {
    Query: {
      books: async (parent, args, context: Context) => await context.dbsource.prisma.book.findMany(),
    },
    Mutation: {
      addBook: async (parent, args, context: Context) => {
        await prisma.book.create({
          data: {
            title: args.title,
            author: args.author
          }
        });
        return await context.dbsource.prisma.book.findMany()
      }
    }
  };


  const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
  const server = new ApolloServer({ schema: schemaWithResolvers, });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({
      dbsource: {
        prisma: prisma
      }
    })
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
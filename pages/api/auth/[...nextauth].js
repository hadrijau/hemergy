import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import {connectToDatabase} from "../../../lib/db";
import {verifyAndLint} from "next/dist/lib/verifyAndLint";
import {verifyPassword} from "../../../lib/auth";

export default NextAuth({
    session: {
        jwt: true
    },
    providers: [
        Providers.Credentials({
            async authorize(credentials) {
                const client = await connectToDatabase()
                const usersCollection = client.db().collection('users')
                const user = await usersCollection.findOne({email: credentials.email})

                if (!user) {
                    await client.close()
                    throw new Error('No user found')
                }

                const isValid = await verifyPassword(credentials.password, user.password)

                if (!isValid) {
                    await client.close()
                    throw new Error('Could not log you in');
                }

                await client.close()
                return {email: user.email}


            }
        })
    ]
})
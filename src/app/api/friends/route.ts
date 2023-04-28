import {NextResponse} from "next/server";
import {addFriendValidator} from "@/lib/validations/add-friend";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";
import {z} from "zod";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const { email: emailToAdd } = addFriendValidator.parse(email);

    const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`)
    if (!idToAdd) {
      return new Response('User not found', {status: 400})
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', {status: 401})
    }

    if(idToAdd === session.user.id) {
      return new Response('You cannot add yourself', {status: 400})
    }

    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id)) as 0|1;
    if(isAlreadyAdded) {
      return new Response('You already requested this user', {status: 400})
    }

    const isAlreadyFriend = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd)) as 0|1;
    if(isAlreadyFriend) {
      return new Response('You already friends', {status: 400});
    }

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response('Friend request sent');

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', {status: 422})
    }
    return new Response('Invalid request', {status: 400})
  }

}
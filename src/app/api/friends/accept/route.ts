
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";
import {z} from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);


    //const user = await fetchRedis('get', `user:email:${emailToAdd}`)
    if (!idToAdd) {
      return new Response('User not found', {status: 400})
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', {status: 401})
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannot add yourself', {status: 400})
    }

    const isAlreadyFriends = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
      );

    if (isAlreadyFriends) {
      return new Response('You already friends', {status: 400})
    }

    const hasFriendRequest = await  fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );
    if (!hasFriendRequest) {
      return new Response('No friend request', {status: 400})
    }

    db.sadd(`user:${session.user.id}:friends`, idToAdd);
    db.sadd(`user:${idToAdd}:friends`, session.user.id);
    db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    return new Response('Friend request accepted');

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload ', {status: 422})
    }
    return new Response('Invalid request', {status: 400})
  }

}
'use client';
import {useState} from "react";
import {Check, UserPlus, X} from "lucide-react";
import axios from "axios";
import {useRouter} from "next/navigation";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[],
  sessionId: string
}
const FriendRequests: React.FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId
  }) => {
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
      incomingFriendRequests
    )
    const router = useRouter();
    const acceptRequest = async (senderId: string) => {
      axios.post('/api/requests/accept', {id: senderId});
      setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId));
      router.refresh();
    }
    const denyRequest = async (senderId: string) => {
      axios.post('/api/requests/deny', {id: senderId});
      setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId));
      router.refresh();
    }



    return <> { friendRequests.length === 0 ? (
      <p className='text-small text-zinc-500'>Nothing to show here... </p>
      ) : (
       friendRequests.map((request) => (
         <div key={request.senderId} className="flex gap-4 items-center">
           <UserPlus className="text-black"/>
           <p className="font-medium text-lg">{request.senderEmail}</p>
           <button aria-label="Accept friend" className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md">
             <Check className="font-semibold text-white w-3/4 h-3/4"/>
           </button>
           <button aria-label="Deny friend" className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md">
             <X className="font-semibold text-white w-3/4 h-3/4"/>
           </button>
           <button></button>
         </div>
       ))
      ) }
    </>

}

export default FriendRequests;
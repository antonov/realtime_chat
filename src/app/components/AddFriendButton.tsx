'use client';
import Button from "@/app/components/Button";
import {addFriendValidator} from "@/lib/validations/add-friend";
import axios, {AxiosError} from "axios";
import {useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

interface AddFriendButtonProps {

}
const AddFriendButton:React.FC<AddFriendButtonProps> = () => {

  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  type FormData = z.infer<typeof addFriendValidator>
  const {
    register,
    handleSubmit,
    setError,
    formState: {errors}
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator)
  });

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  }

  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendValidator.parse({email});
      await axios.post('/api/friends',
        {
         email: validatedEmail
        });
      setShowSuccess(true);
    } catch (error) {
      if(error instanceof z.ZodError){
        setError('email',{ message: error.message });
      }
      if (error instanceof AxiosError) {
        setError('email',{ message: error.response?.data });
      }
      setError('email',{ message: 'Something went wrong' });
    }
  }
  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
        Add friend by email
      </label>
      <div className='mt-2 flex gap-4'>
        <input type="text" {...register('email')} placeholder="you@example.com" className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message }</p>
      {showSuccess && <p className="mt-1 text-sm text-green-600">Friend added successfully</p>}
  </form>)
}
export default AddFriendButton;
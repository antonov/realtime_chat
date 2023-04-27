'use client';
import {Toaster} from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}
const Providers: React.FC<ProvidersProps> = ({children}) => {

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  )

}
export default Providers;
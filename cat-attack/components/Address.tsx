import { useAddress } from '@thirdweb-dev/react';
import {Dispatch, SetStateAction} from 'react'

const Address: React.FC<{
    address: string;
    setText: Dispatch<SetStateAction<string>>;
}> = ({ address, setText }) => {
    // Taking the address of the connected user here
    const currentAddress = useAddress();
  return (
        <span
        // Setting up the input box to the text that was clicked in the events
        onClick={() => setText(address)}
        style={{
            cursor: "pointer",
            textDecoration: "underline"
        }}
        >
            {/* We will then just render "You" if the event was related to the connected user or another address */}
            {currentAddress === address ? "You " : address}
        </span>
  )
}

export default Address
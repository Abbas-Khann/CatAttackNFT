import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractEvents,
  useOwnedNFTs,
  Web3Button,
  ThirdwebNftMedia,
} from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import { useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Address from "../components/Address";

// Here we will paste in the address of the deployed contract
const CONTRACT_ADDRESS = "0x43391Faa6F5b388D2C58A3fD650146e76c8c9C8B";

const Home: NextPage = () => {
  // This will fetch the address of the connected user
  const address = useAddress();
  // We will pass in the address of the smart contract in the useContract hook we just imported
  const { contract } = useContract(CONTRACT_ADDRESS);
  // Now we will use the useOwnedNFTs hook to and pass in the contract address and wallet address 
  // this will get the owned NFTs for a specific ERC721 or ERC1155 Wallet address
  const { data: nfts } = useOwnedNFTs(contract, address);
  // console.log(nfts)
  // if the wallet doesn't have any nfts we will store that state in a variable called hasNothing
  const hasNothing = nfts?.length === 0;
  // If the wallet owns a level 1 NFT which means a kitten the some method will return a truthy value
  const hasLevel1 = nfts?.some((nft) => nft.metadata.id.toNumber() === 0);
  // If the wallet instead owns a level 2 NFT do the same process
  const hasLevel2 = nfts?.some((nft) => nft.metadata.id.toNumber() === 1);
  // Same process here
  const hasLevel3 = nfts?.some((nft) => nft.metadata.id.toNumber() === 2);
  // Now let's keep track of the totalPoints
  const totalPoints = nfts?.reduce((prev, curr) =>
    prev + (curr.quantityOwned as BigNumber).toNumber() * 
    (curr.metadata.id.toNumber() + 1),
    0
  );

  // Now let's fetch the contract events using the useContractEvents hook from the sdk
  const events = useContractEvents(contract);
  const myEvents = events.data?.filter((event) => {
    return event.eventName === "LevelUp" || event.eventName === "Miaowed"
  }).slice(0 , 20);
  // log it to the console so that you can see the data it's returning
  console.log(myEvents)

  // Creating a switch case statement here to specify levels for each type of a cat
  const getLevel = (level: number) => {
    switch(level) {
      case 1: 
      return <span>🐱 Kitten</span>
      case 2: 
      return <span>😾 Grumpy Cat</span>
      case 3:
      return <span>🥷 Ninja Cat</span>
    }
  }
  
  // Here we will create two states for transferring and checking errors
  const [transferTo, setTransferTo] = useState<string>("");
  const [error, setError] = useState<string>("");
  // In order to display NFTs we will map through the data and use the ThirdwebNftMedia method to render each of them
  const renderNfts = nfts?.map((nft) => {
    return(
      <div key={nft.metadata.id.toString()} className={styles.imageDiv}>
              <ThirdwebNftMedia metadata={nft.metadata} className={styles.image} />
              <h3>{nft.metadata.name} - {nft.metadata.description} (
                  {(nft.quantityOwned as BigNumber).toString()})
              </h3>
      </div>
    )
  })

  // Similarly we need to map through the events and render different components based off of the event that took place
  const displayEvents = myEvents?.map((event) => {
    // When the LevelUp event is executed we will perform the following actions
    if(event.eventName == "LevelUp") {
      return (
        <span className={styles.flex} key={`${event.transaction.transactionHash}_ ${event.transaction.logIndex}`}>
        {/* <span> */}
        <Address 
        address={event.data.account as string}
        setText={setTransferTo} 
        />
        😺 leveled up to  {" "}
        {getLevel((event.data.level as BigNumber).toNumber())}
        {/* </span> */}
        </span>
      )
    }
    // Similarly here for the Miaowed event which was for the attack function we will render the actions below
      if(event.eventName == "Miaowed") {
        return(
          <div className={styles.flex} key={`${event.transaction.transactionHash}_ ${event.transaction.logIndex}`}>
          <h4
          >
          <Address 
          address={event.data.attacker as string}
          setText={setTransferTo}
          /> {""}
          just destroyed {""}
          <Address 
          address={event.data.victim as string}
          setText={setTransferTo}
          /> {" "}
          {getLevel((event.data.level as BigNumber).toNumber())}
          </h4>
          </div>
        )
      }
  })

  return (
    <main className={styles.main}>
      <nav className={styles.navbar}>
      <h1>Cat Attack NFT</h1>
      <div className={styles.wallet}>
        {/* adding the wallet connection here */}
      <ConnectWallet accentColor="#1E0B19" colorMode="dark"  />
      </div>
      </nav>
      <div>
        {/* If the wallet is connected we want to render the following JSX */}
        {address ? (<>
        {/* If the user doesn't have any cats we will print the message in the h2 tag */}
          {hasNothing && <h2>You do not own any cats</h2>} 
          {/* Here we are rendering the variable we created above to display the NFTs */}
          {renderNfts} 
          {/* If the totalPoints has a value and is greater than zero we will display them in a h3 tage else undefined */}
          {totalPoints && totalPoints > 0 ? (
            <h3 className={styles.points}>Total Points: {totalPoints}</h3>
          ): undefined}
          {/* If hasNothing is returning a truthy value we will allow the user to claim a kitten to start playing */}
          {hasNothing && (
            <>
              <h2 className={styles.claim}>Claim your Kitten to start playing</h2>
              <div className={styles.web3Btn}>
                {/* Here we're using the amazing Web3Button component and passing in the contract address
                We are also using the action attribute to call the claimKitten function from the contract
                */}
              <Web3Button 
              contractAddress={CONTRACT_ADDRESS}
              accentColor=""
              action={(contract) => contract.call("claimKitten")}
              onError={(error) => setError(error.message)}
              onSubmit={() => setError("")}
              >
                Claim
              </Web3Button>
              </div>
            </>
          )}
          {/* Now if the player owns the level one NFT we will ask them to send it to another address for upgrade */}
          {hasLevel1 && !hasLevel2 && (
            <>
              <h2 className={styles.catTransfer}>Send your kitten to someone else to upgrade</h2>
              <div className={styles.input}>
                {/* Here we are taking the input address for recipient to recieve NFT and passing in the value */}
              <input 
              onChange={(event) => setTransferTo(event.target.value)}
              value={transferTo}
              className={styles.input}
              placeholder="Enter address "
              />
              </div>
              <div className={styles.web3Btn}>
                {/* Once again using the Web3Button component to pass in the address and call the transfer function */}
              <Web3Button 
              contractAddress={CONTRACT_ADDRESS}
              action={(contract) => {
                contract.erc1155.transfer(transferTo, 0, 1);
              }}
              onError={(error) => setError(error.message)}
              onSubmit={() => setError("")}
              >
                Transfer
              </Web3Button>
              </div>
            </>
          )}
          {/* if the user now owns a level 2 NFT we will now ask the user to burn that token and get a Level 3 NFT */}
          {hasLevel2 && (
            <>
            <h2 className={styles.catTransfer}>Ascend to Ninja Status</h2>
            <div className={styles.web3Btn}>
              {/* Here the burn function will be called on the level 2 nft */}
            <Web3Button
            contractAddress={CONTRACT_ADDRESS}
            action={(contract) => contract.erc1155.burn(1, 1)}
            onError={(error) => setError(error.message)}
            onSubmit={() => setError("")}
            >
              Burn it
            </Web3Button>
              </div>
            </>
          )}
          {/* And Now the user has a level3 NFT and is ready to take on other cats */}
          {hasLevel3 && (
            <>
             <h2 className={styles.catTransfer}>Attack another Cat!</h2>
             <div className={styles.input}>
              {/* This time we are taking the address of the victim and passing that in */}
             <input 
             onChange={(event) => setTransferTo(event.target.value)}
             value={transferTo}
             className={styles.input}
             placeholder="Enter victim address"
             />
             <div className={styles.web3Btn}>
              {/* And now we are calling the attack function on the Web3Button component */}
             <Web3Button
             accentColor="#D2001A"
              contractAddress={CONTRACT_ADDRESS}
              action={(contract) => contract.call("attack", transferTo)}
              onSubmit={() => setError("")}
              onError={(error) => setError(error.message)}
              >
              Attack
             </Web3Button>
              </div>
               </div>
            </>
          )}
        </>
        ): 
        <h2 className={styles.connectWallet}>Connect Your Wallet to get Started</h2>
        }
        {/* We will print the error if we run into any */}
        {error && <h3 className={styles.error}>{error}</h3>}
        <div className={styles.events}>
        <h1>Game Events</h1>
        {/* Here we will finally display the game events to show all the events happening */}
        {myEvents && myEvents?.length > 0
        ? displayEvents :
         "No events yet"
        }
        </div>
      </div>
    </main>
  );
};

export default Home;
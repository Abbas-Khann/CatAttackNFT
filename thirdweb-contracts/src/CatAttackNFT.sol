// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC1155LazyMint.sol";

contract CatAttackContract is ERC1155LazyMint {
    constructor(
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    ) ERC1155LazyMint(_name, _symbol, msg.sender, 0) {}

    // Let's override the burn function from the ERC1155LazyMint Contract
    function burn(
        address _owner,
        uint256 _tokenId,
        uint256 _amount
    ) external override
    {
        address caller = msg.sender;
        // Now we will call the burn function and pass in the arguments
        // This will burn the nft
        _burn(_owner, _tokenId, _amount);
        // If the tokenId is 0 which means the kitten then we will mint another token
        if (tokenId == 0) {
            // Here we are calling the _mint function which will mint us another nft
            _mint(_owner, 1, 1)
            // A tokenId 1 will be minted with the amount being 1 aswell since we only want to mint one token after a successfull burn
        }

    }

}
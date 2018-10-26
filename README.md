# ERC721x — A Smarter Token for the Future of Crypto Collectibles  
ERC721x is an extension of ERC721 that adds support for multi-fungible tokens and batch transfers, while being fully backward-compatible.

**Quick Links:**

- [ERC721x Interface](contracts/Interfaces/ERC721X.sol)

- [ERC721x Receiver](contracts/Interfaces/ERC721XReceiver.sol)

- [ERC721x Reference Implementation](contracts/Core/ERC721X/ERC721XToken.sol)

- [ERC721x Backwards Compatibility Layer](contracts/Core/ERC721X/ERC721XTokenNFT.sol)

- [Open source under BSD-3](LICENSE)
---

**The ERC721x Interface:**

```sol
contract ERC721X {
  function implementsERC721X() public pure returns (bool);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function balanceOf(address owner) public view returns (uint256);
  function balanceOf(address owner, uint256 tokenId) public view returns (uint256);
  function tokensOwned(address owner) public view returns (uint256[], uint256[]);

  function transfer(address to, uint256 tokenId, uint256 quantity) public;
  function transferFrom(address from, address to, uint256 tokenId, uint256 quantity) public;

  // Fungible Safe Transfer From
  function safeTransferFrom(address from, address to, uint256 tokenId, uint256 _amount) public;
  function safeTransferFrom(address from, address to, uint256 tokenId, uint256 _amount, bytes data) public;

  // Batch Safe Transfer From
  function safeBatchTransferFrom(address _from, address _to, uint256[] tokenIds, uint256[] _amounts, bytes _data) public;

  function name() external view returns (string);
  function symbol() external view returns (string);

  // Required Events
  event TransferWithQuantity(address indexed from, address indexed to, uint256 indexed tokenId, uint256 quantity);
  event TransferToken(address indexed from, address indexed to, uint256 indexed tokenId, uint256 quantity);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
  event BatchTransfer(address indexed from, address indexed to, uint256[] tokenTypes, uint256[] amounts);
}
```

----

**Quick Start:**

```bash

yarn add erc721x

```


```bash

npm install erc721x

```

To run the tests in this repo, simply clone it and run `truffle test`

----

### Background
Here at Loom Network, we’ve been working on Zombie Battleground, a 100% on-chain collectible card game that’s targeted at the mainstream audience. Recently, we finished a Kickstarter campaign, and as part of the early backer packages, we will be delivering almost 2 million cards to these backers. We started with a normal ERC721 smart contract, but quickly realized that we needed some adjustments to make it mainstream-friendly. Here are the criteria we’re working with:

Transfers should cost very little gas, even if the player is transferring a large quantity of items. For example, someone might want to transfer a few hundred very cheap cards that are worth little individually, but quite valuable in bulk.
One contract should contain multiple “classes” of items. For example, under the broad category of Zombie Battleground cards, we want to have 100 different kinds of cards, each having many copies.
Compatibility with marketplaces, wallets, and existing infrastructure (e.g. Etherscan). Wallet and marketplace makers provide a valuable service to the community, and it makes sense to leverage their existing work.

### The Current Landscape

|  ERC # | Cheap Bulk Transfers  |  Multiple Classes of NFT/FT | Works as a Collectible   |  Wallet/Marketplace Compatibility |
|---|---|---|---|---|
|  ERC721  |  NO | NO  | YES  | YES  |
|  ERC20 |  YES | NO  |  NO |  YES |
|  ERC1155 |  YES |  YES | YES  | NO  |
|  ERC1178 | YES  | YES  |  NO | NO  |

We are not the first ones to need something like this, and there have been a few brilliant proposals on github. But every single instance sacrifices compatibility with existing wallets and marketplaces by creating an entirely new specification. While we wholeheartedly support new breakthroughs, it seemed to us that the more pragmatic path — the one we can use NOW instead of months later — would be to extend ERC721 somehow, rather than abandoning it altogether.

Our Approach: Extending ERC721 with ERC1178
Out of all the existing solutions to this problem, the one that best suited our needs was ERC1178 (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1178.md).

It is extremely easy to read and understand because of its similarity to ERC20 — easy enough that any curious user can audit the smart contract and see what the developer put in it. (If they need a little help, doing a lesson on CryptoZombies.io should be enough 😉)
It has very little bloat — just the bare minimum to implement the necessary features. The fewer things added, the better the chances are that it’s secure, because it deviates less from battle-tested code.
It’s really useful for things beyond just games — for example, creating a token that can represent preferred, common, or restricted shares of a company.

![image copied on 2018-09-07 at 19 14 21 pm](https://user-images.githubusercontent.com/1289797/45216191-45e03d00-b2d2-11e8-8fa8-88bc761a3584.png)


Using ERC1178 as the base, we added a very thin optional layer of features to support crypto-collectibles, then wrapped everything with an ERC721 compatibility layer.

### Real World Usage

ERC721x is immediately usable with any ERC721-compatible wallet, marketplace, or service. For example, you can browse for a card in Trust Wallet and easily transfer it to your friend. That person can check the status of the transfer on Etherscan, and then resell it by sending it to OpenSea or Rarebits.

Then, on a service that supports the enhanced features, such as cheap batch transfers, you get all the improved benefits, without the end user needing to know about any of the details. For example, on the Loom Trading Post, you can send hundreds of cards for the price of sending one, and you can enjoy transactions that are completely free by storing the cards on PlasmaChain 😎

### Conclusion

Beyond the technical bits that make up blockchains, the spirit of blockchain tech is equally (if not more) important. Services should be interoperable, open, and compatible. It doesn’t matter if you add a million features when the end user has no wallet that can open them and no service like Etherscan that can view them.

At the same time, any improvements made to a technology should aim to be as seamless as possible. We can see a wonderful example of this with our USB devices. There’s absolutely no need for us to stop and think, “Is this USB 1.0, 2.0, or 3.0?” We are spared from this mental overhead because, even if not all the new features are supported, we will still be able to use the device the exact same way.

It’s these two principles that led us to create the new ERC721x, specifically for crypto-collectibles — and it’s completely open source.

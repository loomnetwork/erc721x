pragma solidity ^0.5.6;

import "./ERC721X/ERC721XToken.sol";

// Example

contract Card is ERC721XToken {

    constructor(string memory _baseTokenURI) public ERC721XToken(_baseTokenURI) {}

    function name() external view returns (string memory) {
        return "Card";
    }

    function symbol() external view returns (string memory) {
        return "CRD";
    }

    // fungible mint
    function mint(uint256 _tokenId, address _to, uint256 _supply) external {
        _mint(_tokenId, _to, _supply);
    }

    // nft mint
    function mint(uint256 _tokenId, address _to) external {
        _mint(_tokenId, _to);
    }
}
